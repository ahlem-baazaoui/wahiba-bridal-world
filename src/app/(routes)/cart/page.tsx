"use client";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart";
import { fetchDresses, Dress } from "@/lib/data/dresses";
import { urlFor } from "@/lib/client";
import Link from "next/link";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { items, removeItem, getTotal } = useCartStore();
  const [dresses, setDresses] = useState<Dress[]>([]);

  useEffect(() => {
    fetchDresses().then(setDresses);
  }, []);

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-16 text-center"
      >
        <h1 className="text-3xl font-bold mb-4">Votre panier est vide</h1>
        <p className="text-gray-600 mb-8">Ajoutez de magnifiques robes à votre panier !</p>
        <Button asChild>
          <Link href="/dresses">Voir les robes</Link>
        </Button>
      </motion.div>
    );
  }

  // Determine if all items are quotes
  const hasOnlyQuoteItems = items.every(item => item.type === 'quote');

  // Calculate total for rental and purchase items only
  const total = items.reduce((sum, item) => {
    if (item.type === 'rental') {
      return sum + (item.pricePerDay || 0) * item.quantity;
    }
    if (item.type === 'purchase') {
      return sum + (item.buyPrice || 0) * item.quantity;
    }
    return sum; // Do not add quote items to the total
  }, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-8"
      >
        Votre panier
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-4"
        >
          {items.map((item, index) => {
            const dress = dresses.find((d) => d._id === item.dressId);
            if (!dress) return null;

            const isRentalWithValidDates = item.type === 'rental' &&
              item.startDate instanceof Date &&
              !isNaN(item.startDate.getTime()) &&
              item.endDate instanceof Date &&
              !isNaN(item.endDate.getTime());
              
            const isQuote = item.type === 'quote';

            return (
              <motion.div
                key={`${item.dressId}-${item.type}-${item.color}-${item.size}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex gap-4 p-4 border rounded-lg"
              >
                <div className="w-24 h-32 relative">
                  <img
                    src={urlFor(dress.colors[0].images[0]).url()}
                    alt={dress.name}
                    className="object-cover w-full h-full rounded"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{dress.name}</h3>
                    <span className="text-sm px-2 py-1 bg-gray-100 rounded-full capitalize">
                      {isQuote ? "Devis" : item.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Couleur: {item.color}
                  </p>
                  <p className="text-sm text-gray-600">
                    {item.size ? 'Taille: ' + item.size : ''}
                  </p>
                  {isRentalWithValidDates && (
                    <p className="text-sm text-gray-600">
                      Dates: {format(item.startDate!, "MMM d")} - {format(item.endDate!, "MMM d")}
                    </p>
                  )}
                  
                  {isQuote ? (
                    <p className="text-sm font-medium mt-2 text-blue-500">
                      Demande de devis
                    </p>
                  ) : (
                    <p className="text-sm font-medium mt-2">
                      {item.type === 'rental'
                        ? `${item.pricePerDay} TND/jour × ${item.quantity} jours = ${((item.pricePerDay || 0) * item.quantity).toFixed(2)} TND`
                        : `${item.buyPrice} TND × ${item.quantity} = ${((item.buyPrice || 0) * item.quantity).toFixed(2)} TND`
                      }
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.dressId, item.type, item.color, item.size)}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="border rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold">Résumé de la commande</h2>
            {hasOnlyQuoteItems ? (
              <p className="text-sm text-center font-medium mt-2 text-blue-500">
                Demande de devis
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span>{total.toFixed(2)} TND</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Livraison</span>
                    <span>Gratuit</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{total.toFixed(2)} TND</span>
                    </div>
                  </div>
                </div>
              </>
            )}
            <Button className="w-full" asChild>
              <Link href="/checkout">Continuer</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}