/**
 * When the download follow-up falls due. The clock starts at the first download and counts 72 hours of
 * weekday time only (Dubai, Monday 00:00 to Friday 24:00). Saturday and Sunday do not count. So a Friday
 * 17:00 download falls due on Wednesday at 17:00, and a weekend download falls due on Thursday at 00:00
 * (72 weekday hours from Monday 00:00). The daily job sends only on Monday to Friday (Dubai).
 * CJ, 19 Nov 2026: "due = first_download_at + 72h counted on Asia/Dubai Monday to Friday only".
 */
export const WAIT_WEEKDAY_HOURS = 72;

const DUBAI_OFFSET_MS = 4 * 3_600_000;
const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

/** Day of the week in Dubai, 0 = Sunday. */
export function dubaiDay(at: Date): number {
  return new Date(at.getTime() + DUBAI_OFFSET_MS).getUTCDay();
}

/** True on the days the follow-up may go: Monday to Friday in Dubai. */
export function isSendDay(at: Date): boolean {
  const d = dubaiDay(at);
  return d !== 0 && d !== 6;
}

/** Start of the Dubai calendar day that contains `ms`, as a UTC timestamp. */
function dubaiDayStart(ms: number): number {
  const local = ms + DUBAI_OFFSET_MS;
  return local - (((local % DAY_MS) + DAY_MS) % DAY_MS) - DUBAI_OFFSET_MS;
}

/** Moves `from` forward (direction 1) or back (direction -1) by `hours` of weekday time only. */
function shiftWeekdayHours(from: number, hours: number, direction: 1 | -1): number {
  let t = from;
  let left = hours * HOUR_MS;
  while (left > 0) {
    const dayStart = dubaiDayStart(direction === 1 ? t : t - 1);
    const weekday = isSendDay(new Date(dayStart));
    const edge = direction === 1 ? dayStart + DAY_MS : dayStart;
    const span = Math.abs(edge - t);
    if (!weekday) { t = edge; continue; }
    if (span >= left) return t + direction * left;
    left -= span;
    t = edge;
  }
  return t;
}

/** The moment a follow-up is due for a first download: 72 weekday hours on. */
export function followUpDueAt(firstDownload: Date | string): Date {
  return new Date(shiftWeekdayHours(new Date(firstDownload).getTime(), WAIT_WEEKDAY_HOURS, 1));
}

/** The latest first-download moment that is due now: the inverse of followUpDueAt, for the sweep. */
export function dueCutoffAt(now: Date): Date {
  return new Date(shiftWeekdayHours(now.getTime(), WAIT_WEEKDAY_HOURS, -1));
}
