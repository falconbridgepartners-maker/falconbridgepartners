import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { announceWeekPlaceholders, createWeekPlaceholders, isoWeekOf } from '@/lib/weekly/placeholders';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/**
 * Monday's job (vercel.json: 0 5 * * 1 is 9am in Dubai, after the 08:10 weekly run has published the week's signals).
 * It makes the week's placeholder study pages, one per territory, links each to its Weekly Signal, and emails Jessica the
 * week's addresses. Sending reserved packs and closing empty placeholders is the daily job's (/api/cron/pack-follow-up). `?week=2026-W44` runs it for another week; `?dry=1` only reports what it would do.
 * Requires CRON_SECRET: Vercel's scheduler sends it; anyone else is turned away.
 */
export async function GET(req: Request) {
  const secret = (process.env.CRON_SECRET || '').trim();
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return new NextResponse('Not authorised.', { status: 401 });
  const url = new URL(req.url);
  const week = /^\d{4}-W\d{2}$/.test(url.searchParams.get('week') ?? '') ? url.searchParams.get('week')! : isoWeekOf().label;
  if (url.searchParams.get('dry') === '1') return NextResponse.json({ ok: true, dry: true, week }, { headers: { 'cache-control': 'no-store' } });

  const created = await createWeekPlaceholders(week);
  for (const p of ['/research', '/research/library', '/sitemap.xml']) revalidatePath(p);
  for (const slug of created.created) revalidatePath(`/research/studies/${slug}`);
  const announced = await announceWeekPlaceholders(week);
  return NextResponse.json({ ok: true, week, created, announced, at: new Date().toISOString() }, { headers: { 'cache-control': 'no-store' } });
}
