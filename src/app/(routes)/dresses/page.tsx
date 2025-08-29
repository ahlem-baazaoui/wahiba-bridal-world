"use client";

import { useState, useMemo, useEffect } from "react";
import { fetchDresses, Dress as BaseDress } from "@/lib/data/dresses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { urlFor } from "@/lib/client";
import { fetchDressAvailability, Availability, normalizeDate } from "@/lib/data/availability";
import { fetchCategories, Category } from "@/lib/data/categories";

interface FilterState {
  colors: string | null;
  sizes: string[];
  priceRange: [number, number];
  startDate?: Date;
  type: "all" | "rental" | "purchase";
  search: string;
}

const isDressAvailable = (
  dressId: string,
  startDate: Date,
  allAvailability: Availability[]
): boolean => {
  const actualAvailability = allAvailability || [];
  const dressAvailability = actualAvailability.find(a => a.dressId === dressId);
  if (!dressAvailability) return true;
  const requested = normalizeDate(startDate);
  const isUnavailable = (dressAvailability.unavailableDates || []).some(period => {
    const periodStart = normalizeDate(period.startDate);
    const periodEnd = normalizeDate(period.endDate);
    return requested >= periodStart && requested <= periodEnd;
  });
  return !isUnavailable;
};

type Dress = BaseDress & {
  categories?: { _id: string; name: string }[];
};

export default function DressesPage() {
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [allAvailability, setAllAvailability] = useState<Availability[]>([]);
  const [isLoadingDresses, setIsLoadingDresses] = useState(true);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    colors: null,
    sizes: [],
    priceRange: [0, 10000],
    type: "all",
    search: "",
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchDresses()
      .then(data => {
        setDresses(data);
        setIsLoadingDresses(false);
      })
      .catch(() => setIsLoadingDresses(false));

    fetchDressAvailability()
      .then(data => {
        setAllAvailability(data);
        setIsLoadingAvailability(false);
      })
      .catch(() => setIsLoadingAvailability(false));

    fetchCategories()
      .then(data => setCategories(data))
      .catch(() => {});
  }, []);

  const allColors = useMemo(() => {
    const colors = new Set<string>();
    dresses.forEach(dress => {
      dress.colors?.forEach(color => colors.add(color.name));
    });
    return Array.from(colors);
  }, [dresses]);

  const allSizes = useMemo(() => {
    const sizes = new Set<string>();
    dresses.forEach(dress => {
      dress.sizes?.forEach(size => sizes.add(size));
    });
    return Array.from(sizes);
  }, [dresses]);

  const filteredDresses = useMemo(() => {
    if (isLoadingDresses || isLoadingAvailability) return [];
    return dresses.filter(dress => {
      if (selectedCategory) {
        const categoryIds = (dress.categories || []).map(cat => cat._id);
        if (!categoryIds.includes(selectedCategory)) return false;
      }
      if (
        !(
          dress.colors &&
          dress.colors.length > 0 &&
          dress.colors[0].images &&
          dress.colors[0].images.length > 0 &&
          dress.colors[0].images[0].asset
        )
      ) {
        return false;
      }
      if (
        filters.search &&
        !dress.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !(dress.description ? dress.description.toLowerCase() : "").includes(filters.search.toLowerCase())
      ) {
        return false;
      }
      if (
        filters.colors &&
        !(dress.colors && dress.colors.some(color => color.name === filters.colors))
      ) {
        return false;
      }
      if (
        filters.sizes.length > 0 &&
        !(dress.sizes && dress.sizes.some(size => filters.sizes.includes(size)))
      ) {
        return false;
      }
      const price = dress.isForSale ? dress.buyPrice ?? 0 : dress.pricePerDay ?? 0;
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }
      if (filters.type !== "all") {
        if (filters.type === "purchase" && !dress.isForSale) return false;
        if (filters.type === "rental" && dress.isForSale) return false;
      }
      if (filters.startDate) {
        if (!isDressAvailable(dress._id, filters.startDate, allAvailability)) {
          return false;
        }
      }
      return true;
    });
  }, [dresses, filters, allAvailability, isLoadingDresses, isLoadingAvailability, selectedCategory]);

  const clearFilters = () => {
    setFilters({
      colors: null,
      sizes: [],
      priceRange: [0, 1000],
      type: "all",
      search: "",
      startDate: undefined,
    });
    setSelectedCategory(null);
  };

  const hasActiveFilters =
    filters.colors !== null ||
    filters.sizes.length > 0 ||
    filters.type !== "all" ||
    filters.startDate ||
    selectedCategory !== null;

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const startDateParam = searchParams.get("date");
    if (startDateParam) {
      setFilters(prev => ({
        ...prev,
        startDate: new Date(startDateParam),
      }));
    }
  }, []);

  const overallLoading = isLoadingDresses || isLoadingAvailability;

  if (overallLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen text-lg text-gray-700">
        Chargement des robes et des disponibilités...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 mb-8"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Robes</h1>
          <div className="flex gap-4">
            <Input
              placeholder="Rechercher des robes..."
              value={filters.search}
              onChange={e =>
                setFilters(prev => ({ ...prev, search: e.target.value }))
              }
              className="w-64"
            />
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline">Filtres</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filtrer les robes</SheetTitle>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  {/* Type Filter */}
                  <div>
                    <h3 className="font-medium mb-2">Type</h3>
                    <Select
                      value={filters.type}
                      onValueChange={value =>
                        setFilters(prev => ({
                          ...prev,
                          type: value as "all" | "rental" | "purchase",
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        <SelectItem value="rental">Location uniquement</SelectItem>
                        <SelectItem value="purchase">Achat uniquement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Color Filter */}
                  <div>
                    <h3 className="font-medium mb-2">Couleurs</h3>
                    <Select
                      value={filters.colors || ""}
                      onValueChange={value =>
                        setFilters(prev => ({
                          ...prev,
                          colors: value === "all" ? null : value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une couleur" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les couleurs</SelectItem>
                        {allColors.map(color => (
                          <SelectItem key={color} value={color}>
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Size Filter */}
                  <div>
                    <h3 className="font-medium mb-2">Tailles</h3>
                    <div className="flex flex-wrap gap-2">
                      {allSizes.map(size => (
                        <Badge
                          key={size}
                          variant={filters.sizes.includes(size) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() =>
                            setFilters(prev => ({
                              ...prev,
                              sizes: prev.sizes.includes(size)
                                ? prev.sizes.filter(s => s !== size)
                                : [...prev.sizes, size],
                            }))
                          }
                        >
                          {size}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {/* Price Range Filter */}
                  <div>
                    <h3 className="font-medium mb-2">Fourchette de prix</h3>
                    <Slider
                      defaultValue={[0, 1000]}
                      max={1000}
                      step={10}
                      value={filters.priceRange}
                      onValueChange={value =>
                        setFilters(prev => ({
                          ...prev,
                          priceRange: value as [number, number],
                        }))
                      }
                    />
                    <div className="flex justify-between mt-2">
                      <span>{filters.priceRange[0]} TND</span>
                      <span>{filters.priceRange[1]} TND</span>
                    </div>
                  </div>
                  {/* Date Availability Filter */}
                  <div>
                    <h3 className="font-medium mb-2">Date souhaitée</h3>
                    <DatePicker
                      value={filters.startDate}
                      onChange={date =>
                        setFilters(prev => ({
                          ...prev,
                          startDate: date ?? undefined,
                        }))
                      }
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={clearFilters}
                  >
                    Réinitialiser tous les filtres
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        {/* Categories List */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
          >
            Toutes les catégories
          </Button>
          {categories.map(cat => (
            <Button
              key={cat._id}
              variant={selectedCategory === cat._id ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat._id)}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </motion.div>
      {/* Active Filters */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          {filters.type !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.type === "rental"
                ? "Location"
                : filters.type === "purchase"
                ? "Achat"
                : filters.type}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() =>
                  setFilters(prev => ({ ...prev, type: "all" }))
                }
              />
            </Badge>
          )}
          {filters.colors && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Couleur : {filters.colors}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() =>
                  setFilters(prev => ({ ...prev, colors: null }))
                }
              />
            </Badge>
          )}
          {filters.sizes.map(size => (
            <Badge
              key={size}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {size}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() =>
                  setFilters(prev => ({
                    ...prev,
                    sizes: prev.sizes.filter(s => s !== size),
                  }))
                }
              />
            </Badge>
          ))}
          {filters.startDate && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Date : {filters.startDate.toLocaleDateString()}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() =>
                  setFilters(prev => ({ ...prev, startDate: undefined }))
                }
              />
            </Badge>
          )}
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {filteredDresses.map((dress, index) => (
          <motion.div
            key={dress._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <Link
              href={`/dress/${dress._id}`}
              className="group block relative"
            >
              {(dress.isRentOnDiscount || (dress.isForSale && dress.isSellOnDiscount) || dress.newCollection) && (
                <span 
                  className={`absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded z-10 shadow ${
                    dress.newCollection ? "bg-[#B8A78F]" : "bg-red-500"
                  }`}
                >
                  {dress.newCollection ? "Nouvelle collection" : "Promo"}
                </span>
              )}
              <div className="space-y-2">
                <div className="aspect-[3/4] overflow-hidden rounded-lg">
                  <img
                    src={urlFor(dress.colors[0].images[0].asset).url()}
                    alt={dress.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{dress.name}</h3>
                  <div className="flex flex-col gap-1 text-sm text-gray-600">
                      {dress.newCollection ? (
                        <span className="text-blue-500 font-semibold">Demander un devis</span>
                      ):
                      <>
                      {/* Rental price */}
                      {dress.isRentOnDiscount && dress.newPricePerDay ? (
                        <div>
                          <span className="line-through text-gray-400">{dress.pricePerDay} TND/jour</span>
                          <span className="text-red-600 font-bold ml-2">{dress.newPricePerDay} TND/jour</span>
                        </div>
                      ) : (
                        <div>
                          <span>{dress.pricePerDay} TND/jour</span>
                        </div>
                      )}
                      {/* Sale price */}
                      {dress.isForSale &&
                        (dress.isSellOnDiscount && dress.newBuyPrice ? (
                          <div>
                            <span className="line-through text-gray-400">{dress.buyPrice} TND à acheter</span>
                            <span className="text-red-600 font-bold ml-2">{dress.newBuyPrice} TND à acheter</span>
                          </div>
                        ) : (
                          <div>
                            <span>{dress.buyPrice} TND à acheter</span>
                          </div>
                        ))}
                      </>
                      }
                      
                    </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
      {filteredDresses.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <h3 className="text-lg font-medium mb-2">Aucune robe trouvée</h3>
          <p className="text-gray-600">
            Essayez de modifier vos filtres ou vos termes de recherche
          </p>
        </motion.div>
      )}
    </div>
  );
}