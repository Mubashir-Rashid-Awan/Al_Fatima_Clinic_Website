import { createClient } from "@/lib/supabase/server";

export interface TimeSlot {
  start_time: string; // "09:00"
  end_time: string; // "09:30"
  available: boolean;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Computes every bookable time slot for a doctor on a given date by:
 * 1. Finding the doctor's recurring weekly availability for that weekday.
 * 2. Removing the date entirely if it falls under doctor_time_off.
 * 3. Slicing the working window into fixed-length slots.
 * 4. Marking a slot unavailable if it collides with an existing appointment
 *    (any status other than "cancelled") or if it is in the past.
 */
export async function getAvailableSlots(
  doctorId: string,
  date: string // "YYYY-MM-DD"
): Promise<TimeSlot[]> {
  const supabase = await createClient();
  const dayOfWeek = new Date(`${date}T00:00:00`).getDay();

  const [{ data: availability }, { data: timeOff }, { data: existingAppointments }] =
    await Promise.all([
      supabase
        .from("doctor_availability")
        .select("start_time, end_time, slot_duration_minutes")
        .eq("doctor_id", doctorId)
        .eq("day_of_week", dayOfWeek)
        .eq("is_active", true),
      supabase
        .from("doctor_time_off")
        .select("id")
        .eq("doctor_id", doctorId)
        .eq("off_date", date),
      supabase
        .from("appointments")
        .select("start_time, end_time, status")
        .eq("doctor_id", doctorId)
        .eq("appointment_date", date)
        .neq("status", "cancelled"),
    ]);

  if (timeOff && timeOff.length > 0) return [];
  if (!availability || availability.length === 0) return [];

  const bookedRanges = (existingAppointments ?? []).map((a) => ({
    start: timeToMinutes(a.start_time.slice(0, 5)),
    end: timeToMinutes(a.end_time.slice(0, 5)),
  }));

  const now = new Date();
  const isToday = date === now.toISOString().slice(0, 10);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const slots: TimeSlot[] = [];

  for (const block of availability) {
    const blockStart = timeToMinutes(block.start_time.slice(0, 5));
    const blockEnd = timeToMinutes(block.end_time.slice(0, 5));
    const duration = block.slot_duration_minutes;

    for (let start = blockStart; start + duration <= blockEnd; start += duration) {
      const end = start + duration;

      const overlapsExisting = bookedRanges.some(
        (r) => start < r.end && end > r.start
      );
      const isPast = isToday && start <= nowMinutes;

      slots.push({
        start_time: minutesToTime(start),
        end_time: minutesToTime(end),
        available: !overlapsExisting && !isPast,
      });
    }
  }

  return slots;
}

/**
 * Returns which of the next N days have at least one available slot,
 * used to grey out fully-booked or closed days in the date picker.
 */
export async function getAvailableDatesInRange(
  doctorId: string,
  startDate: Date,
  numDays: number
): Promise<Set<string>> {
  const dates: string[] = [];
  for (let i = 0; i < numDays; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }

  const results = await Promise.all(dates.map((date) => getAvailableSlots(doctorId, date)));

  const availableDates = new Set<string>();
  results.forEach((slots, i) => {
    if (slots.some((s) => s.available)) availableDates.add(dates[i]);
  });

  return availableDates;
}
