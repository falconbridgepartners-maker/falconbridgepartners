/**
 * When the download follow-up falls due. The clock starts at the first download; the email goes once the
 * download is WAIT_HOURS old, and never on a Saturday or Sunday (Dubai time), so a Thursday download is
 * written to on Monday rather than at the weekend.
 */
export const WAIT_HOURS = 72;

const DUBAI_OFFSET_MS = 4 * 3_600_000;

/** Day of the week in Dubai, 0 = Sunday. */
export function dubaiDay(at: Date): number {
  return new Date(at.getTime() + DUBAI_OFFSET_MS).getUTCDay();
}

/** True on the days the follow-up may go: Monday to Friday in Dubai. */
export function isSendDay(at: Date): boolean {
  const d = dubaiDay(at);
  return d !== 0 && d !== 6;
}

/** The moment a follow-up is due for a first download: WAIT_HOURS on, rolled forward past a weekend. */
export function followUpDueAt(firstDownload: Date | string): Date {
  const due = new Date(new Date(firstDownload).getTime() + WAIT_HOURS * 3_600_000);
  while (!isSendDay(due)) due.setTime(due.getTime() + 86_400_000);
  return due;
}
