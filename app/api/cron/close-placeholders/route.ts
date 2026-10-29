import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { closeWeekPlaceholders, isoWeekOf } from '@/lib/weekly/placeholders';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/**
 * Thursday's job (vercel.json: 0 8 * * 4 is 12:00 in Dubai). Every week placeholder still without its pack is closed:
 * the page says nothing in that week's signal was worth a full study, and everyone waiting is emailed once.
 * `?week=2026-W45` closes through another week; `?dry=1` only reports. Requires CRON_SECRET.
 */
export async function GET(req: Request) {
  const secret = (process.env.CRON_SECRET || '').trim();
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return new NextResponse('Not authorised.', { status: 401 });
  const url = new URL(req.url);
  const week = /^\d{4}-W\d{2}$/.test(url.searchParams.get('week') ?? '') ? url.searchParams.get('week')! : isoWeekOf().label;
  if (url.searchParams.get('dry') === '1') return NextResponse.json({ ok: true, dry: true, week }, { headers: { 'cache-control': 'no-store' } });
  const result = await closeWeekPlaceholders(week);
  for (const slug of result.closed) revalidatePath(`/research/studies/${slug}`);
  return NextResponse.json({ ok: true, ...result, at: new Date().toISOString() }, { headers: { 'cache-control': 'no-store' } });
}
