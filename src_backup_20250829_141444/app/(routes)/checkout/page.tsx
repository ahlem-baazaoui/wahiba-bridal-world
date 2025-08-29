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

const TUNISIAN_STATES = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa", "Jendouba",
  "Kairouan", "Kasserine", "Kébili", "Le Kef", "Mahdia", "La Manouba",
  "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana",
  "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"
];

const formSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(8, "Valid phone number is required"),
  address: z.string().min(5, "Address is required"),
  postalCode: z.string().min(4, "Postal code is required"),
  state: z.string().min(2, "State is required"),
  note: z.string().optional(),
  tryOnDate: z.date({ required_error: "Please select a try-on date" }),
}).refine((data) => {
    const rentalItems = useCartStore.getState().items.filter(item => item.type === 'rental' && item.startDate);
    if (!data.tryOnDate || rentalItems.length === 0) {
        return true;
    }
    const earliestRentalStartDate = rentalItems.reduce((minDate, item) => {
        const itemStartDate = new Date(item.startDate!);
        return itemStartDate < minDate ? itemStartDate : minDate;
    }, new Date(8640000000000000));

    const normalizedTryOnDate = new Date(data.tryOnDate);
    normalizedTryOnDate.setHours(0, 0, 0, 0);

    const normalizedEarliestRentalStartDate = new Date(earliestRentalStartDate);
    normalizedEarliestRentalStartDate.setHours(0, 0, 0, 0);

    return normalizedTryOnDate < normalizedEarliestRentalStartDate;
}, {
    message: "Try-on date must be before the rental period starts.",
    path: ["tryOnDate"],
});

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal } = useCartStore();
  const [dresses, setDresses] = useState<Dress[]>([]);

  useEffect(() => {
    fetchDresses().then(setDresses);
  }, []);

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
        // Only include size if present
        ...(item.size ? { size: item.size } : {}),
        quantity: item.quantity,
        startDate: item.startDate ? new Date(item.startDate).toISOString() : undefined,
        endDate: item.endDate ? new Date(item.endDate).toISOString() : undefined,
        pricePerDay: item.pricePerDay,
        buyPrice: item.buyPrice,
        type: item.type,
      };
    });

    const total = getTotal();

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
      await updateMonthlyRevenueOnPurchase();
      router.push("/success");
    } catch (error) {
      alert("There was an error submitting your order. Please try again.");
      console.error(error);
    }
  }

  async function updateMonthlyRevenueOnPurchase() {
    // Get current month as ISO string (e.g. 2025-06-01T00:00:00.000Z)
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
            salesRevenue += item.buyPrice * item.quantity|| 0;
          } else if (item.type === "rental") {
            totalRental += item.quantity;
            rentalRevenue += item.pricePerDay * item.quantity || 0;
          }
        }
      }
    }

    // Update the record in Sanity
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

                {/* State Dropdown */}
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

              {/* Try On Date Section */}
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                          {item.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {item.color}
                        {/* Only show size if present */}
                        {item.size ? ` | ${item.size}` : ""}
                      </p>
                      {item.type === 'rental' && item.startDate && item.endDate && (
                        <p className="text-sm text-gray-600">
                          {format(item.startDate, "MMM d")} - {format(item.endDate, "MMM d")}
                        </p>
                      )}
                      <p className="text-sm font-medium mt-1">
                        {item.type === 'rental'
                          ? `${dress.pricePerDay} TND/jour × ${item.quantity} jours`
                          : `${dress.buyPrice} TND × ${item.quantity}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {item.type === 'rental'
                          ? `${dress.pricePerDay * item.quantity} TND`
                          : `${(dress.buyPrice || 0) * item.quantity} TND`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span>{getTotal()} TND</span>
              </div>
              <div className="flex justify-between">
                <span>Livraison</span>
                <span>Gratuit</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{getTotal()} TND</span>
                </div>
              </div>
              {form.watch("tryOnDate") && (
                <div className="flex justify-between">
                  <span>Date d&apos;essayage</span>
                  <span>{format(form.watch("tryOnDate"), "PPP")}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}