import { NextResponse } from 'next/server';
import { sendDueFollowUps } from '@/lib/packFollowUp';
import { fulfilPendingReservations } from '@/lib/packReservations';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * The job behind the pack emails. vercel.json runs it three times a day (05:00, 09:00 and 13:00 UTC = 09:00, 13:00 and 17:00 Dubai) so a follow-up goes within hours of falling due, not up to a day late.
 * It emails every reader whose first download is 72 weekday hours old and who has had no follow-up yet, Monday to Friday only;
 * and sends any reserved pack whose study has since been published (a safety net — the importer sends them at once).
 * Closing week placeholders with no study is Thursday's job (/api/cron/close-placeholders).
 * Vercel calls it with CRON_SECRET when that variable is set; anyone else is turned away.
 */
export async function GET(req: Request) {
  const secret = (process.env.CRON_SECRET || '').trim();
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) return new NextResponse('Not authorised.', { status: 401 });
  const followUps = await sendDueFollowUps();
  const reserved = await fulfilPendingReservations().catch((e) => ({ error: e instanceof Error ? e.message : String(e) }));
  return NextResponse.json({ ...followUps, reserved }, { headers: { 'cache-control': 'no-store' } });
}
