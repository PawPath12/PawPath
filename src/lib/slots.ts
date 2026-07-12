// Availability engine: turns weekly recurring availability windows into concrete
// bookable start times, excluding slots that collide with existing appointments
// or fall in the past.

export type Window = {
  dayOfWeek: number;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
};

export type Busy = { startAt: Date; endAt: Date };

export type DaySlots = { date: Date; slots: Date[] };

function hm(time: string): [number, number] {
  const [h, m] = time.split(":").map(Number);
  return [h, m];
}

function atTime(day: Date, time: string): Date {
  const [h, m] = hm(time);
  const d = new Date(day);
  d.setHours(h, m, 0, 0);
  return d;
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/** Concrete open start times for a single date. */
export function slotsForDate(
  date: Date,
  windows: Window[],
  durationMin: number,
  busy: Busy[],
  now: Date = new Date(),
): Date[] {
  const day = date.getDay();
  const todays = windows.filter((w) => w.dayOfWeek === day);
  const stepMs = durationMin * 60_000;
  const out: Date[] = [];

  for (const w of todays) {
    const winStart = atTime(date, w.startTime);
    const winEnd = atTime(date, w.endTime);
    for (let t = winStart.getTime(); t + stepMs <= winEnd.getTime() + 1; t += stepMs) {
      const start = new Date(t);
      const end = new Date(t + stepMs);
      if (start < now) continue; // no past slots
      const clash = busy.some((b) => overlaps(start, end, b.startAt, b.endAt));
      if (!clash) out.push(start);
    }
  }
  // Dedupe + sort (overlapping windows could produce duplicates).
  const seen = new Set<number>();
  return out
    .filter((d) => (seen.has(d.getTime()) ? false : (seen.add(d.getTime()), true)))
    .sort((a, b) => a.getTime() - b.getTime());
}

/** Open slots grouped by day for the next `daysAhead` days that have any. */
export function upcomingSlots(
  windows: Window[],
  durationMin: number,
  busy: Busy[],
  daysAhead = 21,
  now: Date = new Date(),
): DaySlots[] {
  const days: DaySlots[] = [];
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);
  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(cursor);
    date.setDate(cursor.getDate() + i);
    const slots = slotsForDate(date, windows, durationMin, busy, now);
    if (slots.length) days.push({ date, slots });
  }
  return days;
}

/** True if `start` (for `durationMin`) is inside an availability window and free. */
export function isSlotBookable(
  start: Date,
  durationMin: number,
  windows: Window[],
  busy: Busy[],
  now: Date = new Date(),
): boolean {
  if (start < now) return false;
  const end = new Date(start.getTime() + durationMin * 60_000);
  const day = start.getDay();
  const inWindow = windows
    .filter((w) => w.dayOfWeek === day)
    .some((w) => {
      const ws = atTime(start, w.startTime);
      const we = atTime(start, w.endTime);
      return start >= ws && end <= we;
    });
  if (!inWindow) return false;
  return !busy.some((b) => overlaps(start, end, b.startAt, b.endAt));
}
