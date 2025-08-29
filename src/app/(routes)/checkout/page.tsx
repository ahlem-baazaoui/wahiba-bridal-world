"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { fetchDresses, Dress } from "@/lib/data/dresses";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { urlFor } from "@/lib/client";
import { client } from "@/lib/client";
import { v4 as uuidv4 } from 'uuid';
import { fetchOrCreateMonthlyRevenue, updateMonthlyRevenue } from "@/lib/data/revenues";
import { fetchCompletedAppointmentsForMonthByTryOnDate } from "@/lib/data/schedules";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const TUNISIAN_STATES = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa", "Jendouba",
  "Kairouan", "Kasserine", "Kébili", "Le Kef", "Mahdia", "La Manouba",
  "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana",
  "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"
];

const formSchema = z.object({
  fullName: z.string().min(2, "Nom complet est requis"),
  phone: z.string().min(8, "Numéro de téléphone valide est requis"),
  address: z.string().min(5, "Adresse est requise"),
  postalCode: z.string().min(4, "Code postal est requis"),
  state: z.string().min(2, "Gouvernorat est requis"),
  note: z.string().optional(),
  tryOnDate: z.date().optional(),
}).refine((data) => {
    const cartItems = useCartStore.getState().items;
    const hasRentalItems = cartItems.some(item => item.type === 'rental');
    
    // If there are rental items, tryOnDate is required
    if (hasRentalItems && !data.tryOnDate) {
        return false;
    }

    // This validation is only for rental items with a valid startDate
    if (hasRentalItems && data.tryOnDate) {
        const rentalItems = cartItems.filter(item => item.type === 'rental' && item.startDate);
        
        // If there are no valid rental items with a start date, the condition is met
        if (rentalItems.length === 0) {
            return true;
        }

        const earliestRentalStartDate = rentalItems.reduce((minDate, item) => {
            // Ensure item.startDate is a valid Date object before comparison
            const itemStartDate = new Date(item.startDate!);
            return itemStartDate < minDate ? itemStartDate : minDate;
        }, new Date(8640000000000000)); // Initialize with a very distant future date

        const normalizedTryOnDate = new Date(data.tryOnDate);
        normalizedTryOnDate.setHours(0, 0, 0, 0);

        const normalizedEarliestRentalStartDate = new Date(earliestRentalStartDate);
        normalizedEarliestRentalStartDate.setHours(0, 0, 0, 0);
        
        if (normalizedTryOnDate >= normalizedEarliestRentalStartDate) {
            return false;
        }
    }

    return true;
}, {
    message: "La date d'essayage doit être avant la période de location.",
    path: ["tryOnDate"],
});

export default function CheckoutPage() {
  const router = useRouter();
  const { items } = useCartStore();
  const [dresses, setDresses] = useState<Dress[]>([]);
  
  const hasRentalItems = items.some(item => item.type === 'rental');
  const hasOnlyQuoteItems = items.length > 0 && items.every(item => item.type === 'quote');

  const total = items.reduce((sum, item) => {
    if (item.type === 'rental') {
      return sum + (item.pricePerDay || 0) * (item.quantity || 0);
    }
    if (item.type === 'purchase') {
      return sum + (item.buyPrice || 0) * (item.quantity || 0);
    }
    return sum;
  }, 0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      address: "",
      postalCode: "",
      state: "",
      note: "",
      tryOnDate: undefined,
    },
  });

  useEffect(() => {
    fetchDresses().then(setDresses);
  }, []);

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items, router]);

  if (items.length === 0) {
    return null;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const scheduleItems = items.map((item) => {
      const dress = dresses.find((d) => d._id === item.dressId);
      return {
        _key: uuidv4(),
        dressName: dress?.name,
        color: item.color,
        ...(item.size ? { size: item.size } : {}),
        quantity: item.quantity,
        startDate: item.startDate ? new Date(item.startDate).toISOString() : undefined,
        endDate: item.endDate ? new Date(item.endDate).toISOString() : undefined,
        pricePerDay: item.pricePerDay,
        buyPrice: item.buyPrice,
        type: item.type,
      };
    });

    const scheduleDoc = {
      _type: "schedules",
      fullName: values.fullName,
      phone: values.phone,
      address: values.address + ", " + values.postalCode + ", " + values.state,
      note: values.note,
      tryOnDate: values.tryOnDate ? new Date(values.tryOnDate).toISOString() : undefined,
      items: scheduleItems,
      total,
      status: "pending",
    };

    try {
      await client.create(scheduleDoc);
      if (!hasOnlyQuoteItems) {
        await updateMonthlyRevenueOnPurchase();
      }
      router.push("/success");
    } catch (error) {
      toast.error("There was an error submitting your order. Please try again.");
      console.error(error);
    }
  }

  async function updateMonthlyRevenueOnPurchase() {
    const now = new Date();
    const monthIso = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const record = await fetchOrCreateMonthlyRevenue(monthIso);
    const appointments = await fetchCompletedAppointmentsForMonthByTryOnDate(monthKey);

    let totalSales = 0;
    let salesRevenue = 0;
    let totalRental = 0;
    let rentalRevenue = 0;

    for (const appt of appointments) {
      if (Array.isArray(appt.items)) {
        for (const item of appt.items) {
          if (item.type === "purchase") {
            totalSales += item.quantity || 0;
            salesRevenue += (item.buyPrice || 0) * (item.quantity || 0);
          } else if (item.type === "rental") {
            totalRental += item.quantity;
            rentalRevenue += (item.pricePerDay || 0) * (item.quantity || 0);
          }
        }
      }
    }

    await updateMonthlyRevenue(record._id, {
      totalSales,
      salesRevenue,
      totalRental,
      rentalRevenue,
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Paiement</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input placeholder="Votre nom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de téléphone</FormLabel>
                    <FormControl>
                      <Input placeholder="+216 22334455" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input placeholder="Adresse" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code postal</FormLabel>
                      <FormControl>
                        <Input placeholder="1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gouvernorat</FormLabel>
                      <FormControl>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between"
                              type="button"
                            >
                              {field.value || "Sélectionner un gouvernorat"}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full min-w-[var(--radix-dropdown-menu-trigger-width)]">
                            {TUNISIAN_STATES.map((state) => (
                              <DropdownMenuItem
                                key={state}
                                onSelect={() => field.onChange(state)}
                              >
                                {state}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note (optionnel)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Instructions ou demandes particulières..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {hasRentalItems && (
                <FormField
                  control={form.control}
                  name="tryOnDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date d&apos;essayage</FormLabel>
                      <FormControl>
                        <DatePicker 
                          value={field.value} 
                          onChange={field.onChange}
                          disabled={(date) => date < new Date()}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex gap-4">
                <Button variant="outline" asChild>
                  <Link href="/cart">Retour au panier</Link>
                </Button>
                <Button type="submit" className="flex-1">
                  Valider le rendez-vous
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <div>
          <div className="border rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold">Résumé de la commande</h2>
            <div className="space-y-4">
              {items.map((item, idx) => {
                const dress = dresses.find((d) => d._id === item.dressId);
                if (!dress) return null;
                
                const isQuote = item.type === 'quote';
                
                // FIX: Explicitly check for valid Date objects
                let formattedStartDate = '';
                let formattedEndDate = '';

                if (item.type === 'rental' && item.startDate && item.endDate) {
                    const tempStartDate = new Date(item.startDate);
                    const tempEndDate = new Date(item.endDate);

                    if (!isNaN(tempStartDate.getTime()) && !isNaN(tempEndDate.getTime())) {
                        formattedStartDate = format(tempStartDate, "MMM d");
                        formattedEndDate = format(tempEndDate, "MMM d");
                    }
                }

                return (
                  <div key={`${item.dressId}-${item.type}-${idx}`} className="flex gap-4">
                    <div className="w-16 h-20 relative">
                      <img
                        src={urlFor(dress.colors[0].images[0]).url()}
                        alt={dress.name}
                        className="object-cover w-full h-full rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{dress.name}</h3>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full capitalize">
                          {isQuote ? "Devis" : item.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Couleur: {item.color}
                        {item.size ? ` | ${item.size}` : ""}
                      </p>
                      {formattedStartDate && formattedEndDate && (
                        <p className="text-sm text-gray-600">
                          {formattedStartDate} - {formattedEndDate}
                        </p>
                      )}
                      
                      {isQuote ? (
                        <p className="text-sm font-medium mt-1 text-blue-500">
                          Demande de devis
                        </p>
                      ) : (
                        <p className="text-sm font-medium mt-1">
                          {item.type === 'rental'
                            ? `${dress.pricePerDay} TND/jour × ${item.quantity} jours`
                            : `${dress.buyPrice} TND × ${item.quantity}`}
                        </p>
                      )}
                    </div>
                    
                    {!isQuote && (
                      <div className="text-right">
                        <p className="font-medium">
                          {item.type === 'rental'
                            ? `${(dress.pricePerDay || 0) * (item.quantity || 0)} TND`
                            : `${(dress.buyPrice || 0) * (item.quantity || 0)} TND`}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!hasOnlyQuoteItems && (
              <div className="border-t pt-4 space-y-2">
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
                {hasRentalItems && form.watch("tryOnDate") && (
                  <div className="flex justify-between">
                    <span>Date d&apos;essayage</span>
                    <span>{format(form.watch("tryOnDate")!, "PPP")}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}