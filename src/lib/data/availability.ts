import { client } from "@/lib/client";

// --- Interfaces for Availability Data ---
interface UnavailableDateRange {
  startDate: Date;
  endDate: Date;
}

export interface Availability {
  dressId: string;
  unavailableDates: UnavailableDateRange[];
}

// --- New interfaces for Sanity Schedule data ---
interface ScheduleItem {
  dressId: string;
  startDate: string; // Dates are typically ISO strings from Sanity
  endDate: string;
  type: 'rental' | 'purchase'; // Assuming these are the types
}

interface Schedule {
  _id: string;
  items: ScheduleItem[];
  status: string; // e.g., "confirmed", "pending", "cancelled"
}

export async function fetchDressAvailability(): Promise<Availability[]> {
  const query = `*[_type == "schedules" && status == "confirmed"]{
    items[]{
      dressId,
      startDate,
      endDate,
      type
    }
  }`;

  try {
    const schedules: Schedule[] = await client.fetch(query, { _ts: Date.now() });

    const dressAvailabilityMap: Map<string, UnavailableDateRange[]> = new Map();

    schedules.forEach((schedule: Schedule) => {
      schedule.items?.forEach((item: ScheduleItem) => {
        if (item.type === 'rental' && item.dressId && item.startDate && item.endDate) {
          const dressId = item.dressId;
          const startDate = new Date(item.startDate);
          const endDate = new Date(item.endDate);

          if (!dressAvailabilityMap.has(dressId)) {
            dressAvailabilityMap.set(dressId, []);
          }
          dressAvailabilityMap.get(dressId)?.push({ startDate, endDate });
        }
      });
    });

    const availabilityArray: Availability[] = Array.from(dressAvailabilityMap.entries()).map(
      ([dressId, unavailableDates]) => ({
        dressId,
        unavailableDates,
      })
    );
    return availabilityArray;
  } catch (error) {
    console.error("Error fetching dress availability from appointments:", error);
    return [];
  }
}

// Helper function to normalize a Date object to just its date part (midnight UTC)
export const normalizeDate = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setUTCHours(0, 0, 0, 0);
  return normalized;
};
