import { client } from "@/lib/client";

export async function fetchOrCreateMonthlyRevenue(month: string) {
  const query = `*[_type == "revenues" && month == '${month}'][0]`;
  let record = await client.fetch(query, { month });
  if (!record) {
    record = await client.create({
      _type: "revenues",
      month,
      totalSales: 0,
      salesRevenue: 0,
      totalRental: 0,
      rentalRevenue: 0,
    });
  }
  return record;
}

export async function updateMonthlyRevenue(recordId: string, data: Partial<{ totalSales: number; salesRevenue: number; totalRental: number; rentalRevenue: number; }>) {
  return client.patch(recordId).set(data).commit();
}
