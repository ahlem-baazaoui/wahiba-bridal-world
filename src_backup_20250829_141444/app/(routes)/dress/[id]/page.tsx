"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { notFound } from "next/navigation";
import { fetchDresses, Dress } from "@/lib/data/dresses";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { useCartStore } from "@/lib/store/cart";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { urlFor } from "@/lib/client";
import { format } from "date-fns";
import { fetchDressAvailability, Availability, normalizeDate } from "@/lib/data/availability";


export default function DressPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const [dress, setDress] = useState<Dress | null>(null);
  const [allAvailability, setAllAvailability] = useState<Availability[]>([]);
  const [isLoadingDress, setIsLoadingDress] = useState(true);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const todayNormalized = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  useEffect(() => {
    fetchDresses().then((dresses) => {
      const found = dresses.find((d) => d._id === id);
      setDress(found || null);
      if (found && found.colors && found.colors.length > 0) {
        setSelectedColor(found.colors[0].name);
      }
      setIsLoadingDress(false);
    }).catch(error => {
        console.error("Failed to fetch dress details:", error);
        setIsLoadingDress(false);
    });

    fetchDressAvailability().then(data => {
      setAllAvailability(data);
      setIsLoadingAvailability(false);
    }).catch(error => {
      console.error("Failed to fetch availability data:", error);
      setIsLoadingAvailability(false);
    });
  }, [id]);

  const isDayDisabled = useCallback((date: Date): boolean => {
    if (date < todayNormalized) {
      return true;
    }

    if (!dress || !dress._id || isLoadingAvailability) {
        return false;
    }

    const dressAvailability = allAvailability.find(a => a.dressId === dress._id);
    if (!dressAvailability) {
      return false;
    }

    const requestedNormalized = normalizeDate(date);

    return (dressAvailability.unavailableDates || []).some(period => {
      const periodStartNormalized = normalizeDate(period.startDate);
      const periodEndNormalized = normalizeDate(period.endDate);
      
      return requestedNormalized >= periodStartNormalized && requestedNormalized <= periodEndNormalized;
    });
  }, [dress, allAvailability, isLoadingAvailability, todayNormalized]);

  const overallLoading = isLoadingDress || isLoadingAvailability;

  if (overallLoading) {
    return <div className="container mx-auto px-4 py-8">Loading dress details and availability...</div>;
  }

  if (!dress) {
    notFound();
  }

  const handleAddToCart = () => {
    if (!selectedColor || !startDate || !endDate) {
      toast.error("Please select all required options (color and dates)");
      return;
    }

    if (startDate >= endDate) {
      toast.error("End date must be after start date");
      return;
    }
    
    const currentCheckDate = new Date(startDate);
    currentCheckDate.setHours(0,0,0,0);
    const normalizedEndDate = new Date(endDate);
    normalizedEndDate.setHours(0,0,0,0);

    while (currentCheckDate <= normalizedEndDate) {
      if (isDayDisabled(currentCheckDate)) {
        toast.error(`The dress is unavailable on ${format(currentCheckDate, "PPP")}. Please choose different dates.`);
        return;
      }
      currentCheckDate.setDate(currentCheckDate.getDate() + 1);
    }


    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    addItem({
      dressId: dress._id,
      quantity: days,
      startDate,
      endDate,
      color: selectedColor,
      size: selectedSize,
      type: 'rental',
      pricePerDay: dress.isRentOnDiscount && dress.newPricePerDay ? dress.newPricePerDay : dress.pricePerDay
    });

    toast.success("Added to cart!");
    router.push("/cart");
  };

  const handleBuyNow = () => {
    if (!selectedColor) {
      toast.error("Please select color");
      return;
    }

    if (!dress.isForSale || !dress.buyPrice) {
      toast.error("This dress is not available for purchase");
      return;
    }

    addItem({
      dressId: dress._id,
      quantity: 1,
      color: selectedColor,
      size: selectedSize,
      type: 'purchase',
      buyPrice: dress.isSellOnDiscount && dress.newBuyPrice ? dress.newBuyPrice : dress.buyPrice
    });

    toast.success("Added to cart!");
    router.push("/cart");
  };

  const selectedColorImages = dress.colors.find(color => color.name === selectedColor)?.images || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Image Gallery */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {selectedColorImages
              .filter(image => image.asset)
              .map((image, index) => (
              <div key={image._key || index} className="aspect-[3/4] overflow-hidden rounded-lg">
                <img
                  src={urlFor(image.asset).url()}
                  alt={`${dress.name} - ${selectedColor} - Image ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
            {selectedColorImages.filter(image => image.asset).length === 0 && (
              <div className="col-span-2 text-center text-gray-500 py-8">
                No images available for this color.
              </div>
            )}
          </div>
        </div>

        {/* Dress Details */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{dress.name}</h1>
            {(dress.isRentOnDiscount || dress.isSellOnDiscount) && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow">
                Promo
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Couleurs</h3>
              <div className="flex gap-2">
                {dress.colors.map((color) => (
                  <Button
                    key={color._key}
                    variant={selectedColor === color.name ? "default" : "outline"}
                    className="capitalize"
                    onClick={() => setSelectedColor(color.name)}
                  >
                    {color.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600 mt-2">
                {isDescriptionExpanded
                  ? dress.description
                  : `${dress.description.substring(0, 100)}... `}
                {dress.description.length > 100 && (
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="text-blue-500 hover:underline"
                  >
                    {isDescriptionExpanded ? "Voir moins" : "Voir plus"}
                  </button>
                )}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Tailles</h3>
              <div className="grid grid-cols-2 gap-2">
                {dress.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`p-2 border rounded ${
                      selectedSize === size
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300"
                    }`}
                  >
                    {size}
                  </button>
                ))}
                {/* 'No size' button removed */}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Tarifs</h3>
              {/* Rental price */}
              {dress.isRentOnDiscount && dress.newPricePerDay ? (
                <p className="text-lg">
                  <span className="line-through text-gray-400 mr-2">{dress.pricePerDay} TND/jour</span>
                  <span className="text-red-600 font-bold">{dress.newPricePerDay} TND/jour à louer</span>
                </p>
              ) : (
                <p className="text-lg">{dress.pricePerDay} TND/jour à louer</p>
              )}
              {/* Sale price */}
              {dress.isForSale && (
                dress.isSellOnDiscount && dress.newBuyPrice ? (
                  <p className="text-lg">
                    <span className="line-through text-gray-400 mr-2">{dress.buyPrice} TND à acheter</span>
                    <span className="text-red-600 font-bold">{dress.newBuyPrice} TND à acheter</span>
                  </p>
                ) : (
                  <p className="text-lg">{dress.buyPrice} TND à acheter</p>
                )
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-2">Sélectionner les dates de location</h3>
              <div className="grid grid-cols-2 gap-4">
                <DatePicker 
                  label="Date de début" 
                  value={startDate}
                  onChange={setStartDate}
                  disabled={isDayDisabled}
                />
                <DatePicker 
                  label="Date de fin" 
                  value={endDate}
                  onChange={setEndDate}
                  disabled={isDayDisabled}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button className="flex-1" onClick={handleAddToCart}>Programmer la location</Button>
              {dress.isForSale && (
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleBuyNow}
                >
                  Programmer l&apos;achat
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
