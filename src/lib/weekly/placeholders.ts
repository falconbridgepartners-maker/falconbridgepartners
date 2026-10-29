import 'server-only';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';
import { territoryName, weekText, type Report } from '@/lib/data';
import { TERRITORY_KEYS } from '@/lib/weekly/manifest';
import { siteSender } from '@/lib/mail';
import { closeReservations } from '@/lib/packReservations';

/**
 * Week placeholders (supabase/012_week_placeholders.sql).
 *
 * Every Monday, before the week's studies exist, the site makes one page per territory at a predictable address:
 * /research/studies/<year>-week-<nn>-<territory>. Jessica's Weekly Signal posts link there. Until the pack lands the
 * page says "on its way" and takes a reader's name and email (see packReservations.ts). When the week's import
 * publishes the study, the importer takes the placeholder row over (same id, same address) and the reservations
 * are sent the pack. A placeholder still without its pack at 12:00 Dubai on the Thursday of its week closes as "no study this
 * week" (closeWeekPlaceholders, run by /api/cron/close-placeholders), and everyone waiting is told once. A study that arrives
 * after that still goes live at the same address, but nobody is emailed (Joel, 29 Oct 2026).
 */

/** The territories that get a placeholder each week. Singapore is not yet live (October 2026). */
export const PLACEHOLDER_TERRITORIES: readonly string[] = TERRITORY_KEYS.filter((t) => t !== 'singapore');

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://falconbp.com').replace(/\/+$/, '');
const DUBAI_OFFSET_MS = 4 * 3_600_000;

/** The ISO 8601 week (Monday to Sunday) that holds a moment, in Dubai time: label "2026-W44" and the Monday as "2026-10-26". */
export function isoWeekOf(at: Date = new Date()): { label: string; monday: string; year: number; week: number } {
  const d = new Date(at.getTime() + DUBAI_OFFSET_MS);
  const day = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dow = day.getUTCDay() || 7; // Monday = 1 … Sunday = 7
  const monday = new Date(day.getTime() - (dow - 1) * 86_400_000);
  // ISO week number: the Thursday of this week decides the year.
  const thursday = new Date(monday.getTime() + 3 * 86_400_000);
  const year = thursday.getUTCFullYear();
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4dow = jan4.getUTCDay() || 7;
  const firstMonday = new Date(jan4.getTime() - (jan4dow - 1) * 86_400_000);
  const week = Math.round((monday.getTime() - firstMonday.getTime()) / (7 * 86_400_000)) + 1;
  return { label: `${year}-W${String(week).padStart(2, '0')}`, monday: monday.toISOString().slice(0, 10), year, week };
}

/** "2026-W44" + "new-zealand" → "2026-week-44-new-zealand". The address a post can carry before the study exists. */
export const placeholderSlug = (weekLabel: string, territory: string) => {
  const m = /^(\d{4})-W(\d{2})$/.exec(weekLabel);
  if (!m) throw new Error(`Not a week label: ${weekLabel}`);
  return `${m[1]}-week-${Number(m[2])}-${territory}`;
};

/** The study page a placeholder lives at. */
export const placeholderUrl = (slug: string) => `${SITE}/research/studies/${slug}`;

export type PlaceholderRow = Pick<Report, 'id' | 'slug' | 'title' | 'territory' | 'week_label' | 'placeholder' | 'placeholder_status'> & { created_at: string };

export type CreateResult = { week_label: string; created: string[]; existing: string[]; failed: string[] };

/**
 * Makes the week's placeholders, one per territory, unless a study or placeholder for that week and territory is already there.
 * Each is a published report row flagged `placeholder`, with the week slug, so the page resolves at once. The published Weekly
 * Signal for the same week and territory, if it is in, is linked to it (scans.report_id) so the two pages point at each other.
 */
export async function createWeekPlaceholders(weekLabel = isoWeekOf().label): Promise<CreateResult> {
  const out: CreateResult = { week_label: weekLabel, created: [], existing: [], failed: [] };
  const db = createAdminClient();
  const { data: have, error } = await db.from('reports').select('id, slug, territory').eq('week_label', weekLabel);
  if (error) { out.failed.push(error.message); return out; }
  const year = Number(weekLabel.slice(0, 4));
  for (const territory of PLACEHOLDER_TERRITORIES) {
    const slug = placeholderSlug(weekLabel, territory);
    const already = (have ?? []).find((r) => r.territory === territory || r.slug === slug);
    if (already) { out.existing.push(already.slug); continue; }
    const place = territoryName[territory] ?? territory;
    const row = {
      slug, title: `${place}: this week's study`, subtitle: `The Global Discovery Research System study for ${place}, ${weekText(weekLabel)}.`,
      kind: 'study', territory, year, published_at: new Date().toISOString().slice(0, 10), facts: [], featured: false,
      week_label: weekLabel, published: true, placeholder: true, placeholder_status: 'pending',
    };
    const { data, error: insErr } = await db.from('reports').insert(row).select('id').single();
    if (insErr) { out.failed.push(`${slug}: ${insErr.message}`); continue; }
    out.created.push(slug);
    // Link the week's signal, if it is already in and not linked to another study.
    await db.from('scans').update({ report_id: data.id }).eq('week_label', weekLabel).eq('territory', territory).is('report_id', null);
  }
  return out;
}

/**
 * Thursday 12:00 Dubai (Joel, 29 Oct 2026): every placeholder for this week, or an earlier one, that is still waiting and has no
 * uploaded file is closed. Its page then says nothing in that week's signal was worth a full study and none will appear, and
 * everyone waiting for the pack is emailed once to say the same. A study that turns up later is still published at the week
 * address by the importer, but closed reservations are never emailed.
 */
export async function closeWeekPlaceholders(throughWeek = isoWeekOf().label): Promise<{ through: string; closed: string[]; notified: number; failed: string[] }> {
  const out = { through: throughWeek, closed: [] as string[], notified: 0, failed: [] as string[] };
  const db = createAdminClient();
  const { data: rows, error } = await db.from('reports').select('id, slug, title, territory, week_label, placeholder, placeholder_status, created_at, files:report_files(storage_path)')
    .eq('placeholder', true).eq('placeholder_status', 'pending').lte('week_label', throughWeek);
  if (error) { out.failed.push(error.message); return out; }
  for (const r of (rows ?? []) as Array<PlaceholderRow & { files?: { storage_path: string | null }[] }>) {
    if ((r.files ?? []).some((f) => f.storage_path)) continue; // the pack is being imported right now: leave it to the importer
    const { data: claimed, error: upErr } = await db.from('reports').update({ placeholder_status: 'no-study' }).eq('id', r.id).eq('placeholder', true).eq('placeholder_status', 'pending').select('id');
    if (upErr) { out.failed.push(`${r.slug}: ${upErr.message}`); continue; }
    if (!claimed || claimed.length === 0) continue; // another run closed it, or the study arrived
    out.closed.push(r.slug);
    try { out.notified += await closeReservations(r); } catch (e) { out.failed.push(`${r.slug}: ${e instanceof Error ? e.message : String(e)}`); }
  }
  return out;
}

const TO = 'jessica@falconbp.com';
const CC = 'joel@falconbp.com';
const FROM_DISPLAY = 'Joel Arcus <joel@falconbp.com>';
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Monday's email to Jessica: the week's six study addresses, each with its Weekly Signal link when the signal is in,
 * and whether the pack is already there. Sent once per week (import_log source "announced:week:<label>").
 */
export async function announceWeekPlaceholders(weekLabel = isoWeekOf().label): Promise<'sent' | 'already' | 'failed'> {
  if (!process.env.RESEND_API_KEY) return 'failed';
  const db = createAdminClient();
  const key = `announced:week:${weekLabel}`;
  const { data: done } = await db.from('import_log').select('id').eq('source', key).limit(1);
  if (done && done.length) return 'already';

  const [{ data: reports }, { data: scans }] = await Promise.all([
    db.from('reports').select('slug, title, territory, placeholder, placeholder_status, files:report_files(storage_path, access)').eq('week_label', weekLabel).eq('published', true),
    db.from('scans').select('slug, territory').eq('week_label', weekLabel).eq('published', true),
  ]);
  const lines = PLACEHOLDER_TERRITORIES.map((territory) => {
    const place = territoryName[territory] ?? territory;
    const r = (reports ?? []).find((x) => x.territory === territory) as (Pick<Report, 'slug' | 'title' | 'territory' | 'placeholder'> & { files?: { storage_path: string | null; access: string }[] }) | undefined;
    const s = (scans ?? []).find((x) => x.territory === territory);
    const packIn = Boolean(r && !r.placeholder && (r.files ?? []).some((f) => f.storage_path && f.access === 'request'));
    return {
      place, slug: r?.slug ?? placeholderSlug(weekLabel, territory), url: placeholderUrl(r?.slug ?? placeholderSlug(weekLabel, territory)),
      signal: s ? `${SITE}/research/weekly-scan/${s.slug}` : null, status: packIn ? 'Pack is in' : 'On its way (reservations open)',
    };
  });
  const wk = weekText(weekLabel) ?? weekLabel;
  const text = [
    'Hi Jessica,', '',
    `The study pages for ${wk} are live on falconbp.com. Link your posts to them now: a page without its pack yet says "on its way" and takes the reader's name and email, and they are sent the pack the moment it lands.`, '',
    ...lines.flatMap((l) => [`${l.place} — ${l.status}`, `Study page: ${l.url}`, l.signal ? `Weekly Signal: ${l.signal}` : 'Weekly Signal: not in yet', '']),
    'Joel',
  ].join('\n');
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#222"><p>Hi Jessica,</p><p>The study pages for ${esc(wk)} are live on falconbp.com. Link your posts to them now: a page without its pack yet says &ldquo;on its way&rdquo; and takes the reader's name and email, and they are sent the pack the moment it lands.</p>${lines
    .map((l) => `<p style="margin:0 0 14px"><strong>${esc(l.place)}</strong> &mdash; ${esc(l.status)}<br>Study page: <a href="${l.url}">${l.url}</a><br>Weekly Signal: ${l.signal ? `<a href="${l.signal}">${l.signal}</a>` : 'not in yet'}</p>`).join('')}<p>Joel</p></div>`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const send = (from: string) => resend.emails.send({ from, to: TO, cc: CC, replyTo: 'joel@falconbp.com', subject: `Study pages for ${wk} on falconbp.com`, text, html });
  let res = await send(FROM_DISPLAY);
  if (res.error) { console.error('[placeholders] joel@ refused:', res.error); res = await send(siteSender('website')); }
  if (res.error) { console.error('[placeholders] announce', res.error); return 'failed'; }
  await db.from('import_log').insert({ week_label: weekLabel, published: true, source: key, created_by: 'placeholders', result: { to: TO, lines } });
  return 'sent';
}
