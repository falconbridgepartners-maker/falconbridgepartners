/**
 * When the download follow-up falls due. The clock starts at the first download and runs in business days
 * (Dubai time, Monday to Friday): the email goes three business days on. A Monday download is written to on
 * Thursday, Tuesday on Friday, Wednesday on Monday, Thursday on Tuesday, Friday on Wednesday. A weekend
 * download counts from Monday.
 */
export const WAIT_BUSINESS_DAYS = 3;

const DUBAI_OFFSET_MS = 4 * 3_600_000;
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

/** The moment a follow-up is due for a first download: WAIT_BUSINESS_DAYS weekdays on, at the same time of day. */
export function followUpDueAt(firstDownload: Date | string): Date {
  const due = new Date(new Date(firstDownload).getTime());
  let counted = 0;
  while (counted < WAIT_BUSINESS_DAYS) {
    due.setTime(due.getTime() + DAY_MS);
    if (isSendDay(due)) counted++;
  }
  return due;
}

/** The latest first-download moment that is due now: the inverse of followUpDueAt, for the daily sweep. */
export function dueCutoffAt(now: Date): Date {
  const cutoff = new Date(now.getTime());
  let counted = 0;
  while (counted < WAIT_BUSINESS_DAYS) {
    cutoff.setTime(cutoff.getTime() - DAY_MS);
    if (isSendDay(cutoff)) counted++;
  }
  return cutoff;
}
