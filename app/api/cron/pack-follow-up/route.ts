import { NextResponse } from 'next/server';
import { sendDueFollowUps } from '@/lib/packFollowUp';
import { fulfilPendingReservations } from '@/lib/packReservations';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * The daily job behind the pack emails (vercel.json schedules it; 0 5 * * * is 9am in Dubai).
 * It emails every reader whose first download is three business days old and who has had no follow-up yet, Monday to Friday only;
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
