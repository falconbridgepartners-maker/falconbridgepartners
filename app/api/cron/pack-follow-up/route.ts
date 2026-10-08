import { NextResponse } from 'next/server';
import { sendDueFollowUps } from '@/lib/packFollowUp';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * The daily job behind the download follow-up (vercel.json schedules it; 0 5 * * * is 9am in Dubai).
 * It emails every reader whose first download is 48 hours old and who has had no follow-up yet.
 * Vercel calls it with CRON_SECRET when that variable is set; anyone else is turned away.
 */
export async function GET(req: Request) {
  const secret = (process.env.CRON_SECRET || '').trim();
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) return new NextResponse('Not authorised.', { status: 401 });
  const out = await sendDueFollowUps();
  return NextResponse.json(out, { headers: { 'cache-control': 'no-store' } });
}
