import { client } from "@/lib/client";

// month: YYYY-MM (e.g. 2025-06)
export async function fetchCompletedAppointmentsForMonthByTryOnDate(month: string) {
  const start = `${month}-01T00:00:00.000Z`;
  // Calculate last day of the month
  const endDate = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0); // 0th day of next month = last day of this month
  const end = `${month}-${String(endDate.getDate()).padStart(2, "0")}T23:59:59.999Z`;
  const query = `*[_type == "schedules" && status == "completed" && tryOnDate >= '${start}' && tryOnDate <= '${end}']`;
  return client.fetch(query, { start, end });
}
