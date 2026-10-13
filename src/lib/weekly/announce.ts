import 'server-only';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';
import { territoryName } from '@/lib/data';
import { siteSender } from '@/lib/mail';

/**
 * After a weekly upload, tells Jessica which pages are new so she can use them in her posts:
 * one email per kind (Weekly Signals, research packs, Professional Curiosity pieces), each listing the slugs and links.
 *
 * Nothing is tracked in a new table: each item announced is written to import_log with source "announced:<kind>:<slug>",
 * so an item is announced once however it was published (the import screen or the automatic job).
 * Only items created in the last RECENT_DAYS are considered, so the back catalogue is never announced.
 */
const RECENT_DAYS = 10;
const TO = 'jessica@falconbp.com';
const CC = 'joel@falconbp.com'; // Joel is copied so he sees each email arrive in his own inbox
const FROM_DISPLAY = 'Joel Arcus <joel@falconbp.com>';
const SITE = 'https://falconbp.com';

type Kind = 'signal' | 'study' | 'piece';
type Item = { kind: Kind; slug: string; title: string; territory: string; url: string };

const META: Record<Kind, { table: 'scans' | 'reports' | 'pieces'; path: string; subject: string; heading: string }> = {
  signal: { table: 'scans', path: '/research/weekly-scan/', subject: 'New Weekly Signals on falconbp.com', heading: 'Weekly Signals' },
  study: { table: 'reports', path: '/research/studies/', subject: 'New research packs on falconbp.com', heading: 'Research packs' },
  piece: { table: 'pieces', path: '/research/professional-curiosity/', subject: 'New Professional Curiosity pieces on falconbp.com', heading: 'Professional Curiosity pieces' },
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export type AnnounceResult = { sent: Array<{ kind: Kind; count: number }>; failed: string[] };

export async function announcePublished(): Promise<AnnounceResult> {
  const out: AnnounceResult = { sent: [], failed: [] };
  if (!process.env.RESEND_API_KEY) { out.failed.push('RESEND_API_KEY is not set.'); return out; }
  const db = createAdminClient();
  const since = new Date(Date.now() - RECENT_DAYS * 86_400_000).toISOString();
  const resend = new Resend(process.env.RESEND_API_KEY);

  for (const kind of Object.keys(META) as Kind[]) {
    const m = META[kind];
    const sel = kind === 'study' ? 'slug, title, territory, kind' : 'slug, title, territory';
    const { data, error } = await db.from(m.table).select(sel).eq('published', true).gte('created_at', since).order('created_at', { ascending: true });
    if (error) { out.failed.push(`${m.heading}: ${error.message}`); continue; }
    let rows = ((data ?? []) as unknown as Array<{ slug: string; title: string; territory: string; kind?: string }>).filter((r) => r.kind !== 'sample');
    if (!rows.length) continue;
    const { data: done } = await db.from('import_log').select('source').in('source', rows.map((r) => `announced:${kind}:${r.slug}`));
    const had = new Set((done ?? []).map((d) => d.source as string));
    rows = rows.filter((r) => !had.has(`announced:${kind}:${r.slug}`));
    if (!rows.length) continue;

    const items: Item[] = rows.map((r) => ({ kind, slug: r.slug, title: r.title, territory: territoryName[r.territory] ?? r.territory, url: `${SITE}${m.path}${r.slug}` }));
    const text = [
      'Hi Jessica,', '',
      `${items.length === 1 ? 'This page is' : 'These pages are'} now live on falconbp.com, ready to use in your posts.`, '',
      `${m.heading}`, '',
      ...items.flatMap((i) => [`${i.territory}: ${i.title}`, `Slug: ${i.slug}`, i.url, '']),
      'Joel',
    ].join('\n');
    const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#222"><p>Hi Jessica,</p><p>${items.length === 1 ? 'This page is' : 'These pages are'} now live on falconbp.com, ready to use in your posts.</p><h3 style="margin:18px 0 6px">${m.heading}</h3>${items
      .map((i) => `<p style="margin:0 0 14px"><strong>${esc(i.territory)}</strong>: ${esc(i.title)}<br>Slug: <code>${esc(i.slug)}</code><br><a href="${i.url}">${i.url}</a></p>`).join('')}<p>Joel</p></div>`;

    const send = (from: string) => resend.emails.send({ from, to: TO, cc: CC, replyTo: 'joel@falconbp.com', subject: m.subject, text, html });
    // From Joel's own address if the mail service accepts it; otherwise from the site's address, with replies still going to Joel.
    let res = await send(FROM_DISPLAY);
    if (res.error) { console.error('[announce] joel@ refused:', res.error); res = await send(siteSender('website')); }
    if (res.error) { out.failed.push(`${m.heading}: ${(res.error as { message?: string }).message ?? 'send failed'}`); continue; }
    await db.from('import_log').insert(items.map((i) => ({ week_label: null, published: true, source: `announced:${kind}:${i.slug}`, created_by: 'announce', result: { to: TO, kind, slug: i.slug } })));
    out.sent.push({ kind, count: items.length });
  }
  return out;
}
