import 'server-only';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';
import { hasGatedPack, readerFiles, territoryName, weekText, type PackReservation, type Report, type ReportFile } from '@/lib/data';
import { buildNoStudyEmail, buildPackEmail, buildReservationEmail } from '@/lib/emailTemplates';
import { newToken } from '@/lib/packAccess';
import { leadsAddress, sendFromSite } from '@/lib/mail';

/**
 * Reservations on a week placeholder (supabase/012_week_placeholders.sql): a reader who arrives before the study
 * exists leaves a name and email. When the study is published with its pack, each reservation becomes an ordinary
 * pack request (access_requests) and the reader is emailed the link — from there the pack page, the download count
 * and the three-business-day follow-up all work as for any other request.
 */

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://falconbp.com').replace(/\/+$/, '');
const resend = () => new Resend(process.env.RESEND_API_KEY);

type ReportLite = Pick<Report, 'id' | 'slug' | 'title' | 'territory' | 'week_label'>;

const weekOf = (r: Pick<Report, 'week_label'>) => weekText(r.week_label) ?? 'this week';
const placeOf = (r: Pick<Report, 'territory'>) => territoryName[r.territory] ?? r.territory;

/** The Weekly Signal page for a report's week and territory, when it is published. */
async function signalUrlFor(r: ReportLite): Promise<string | null> {
  if (!r.week_label) return null;
  const db = createAdminClient();
  const { data } = await db.from('scans').select('slug').eq('week_label', r.week_label).eq('territory', r.territory).eq('published', true).limit(1).maybeSingle();
  return data ? `${SITE}/research/weekly-scan/${data.slug}` : null;
}

/** Records a reservation (one per email per page) and sends the "on its way" email. Returns false if the email could not be sent. */
export async function reservePack(report: ReportLite, reader: { fullName: string; email: string; organisation?: string | null }): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const db = createAdminClient();
  const { error } = await db.from('pack_reservations').upsert(
    { report_id: report.id, full_name: reader.fullName, email: reader.email, organisation: reader.organisation || null, consent: true },
    { onConflict: 'report_id,email', ignoreDuplicates: false },
  );
  if (error) { console.error('[reserve-pack] insert', error); return { ok: false, error: 'The reservation could not be recorded. Please try again.', status: 500 }; }
  if (!process.env.RESEND_API_KEY) return { ok: true };
  const mail = buildReservationEmail({
    name: reader.fullName, territory: placeOf(report), weekText: weekOf(report), pageUrl: `${SITE}/research/studies/${report.slug}`,
    signalUrl: await signalUrlFor(report), replyTo: leadsAddress(),
  });
  const sent = await sendFromSite('research', (from) => resend().emails.send({ from, to: reader.email, replyTo: leadsAddress(), ...mail }));
  if (sent.error) { console.error('[reserve-pack] reader email', sent.error); return { ok: false, error: 'The confirmation could not be sent. Please check the address and try again.', status: 502 }; }
  return { ok: true };
}

/**
 * Sends the pack to every open reservation on a study that is now published with its gated pack.
 * Each reservation becomes an access_requests row with its own expiring link, exactly as if the reader had asked that moment.
 * Safe to call more than once: a reservation is fulfilled once (fulfilled_at).
 */
export async function fulfilReservations(reportId: string): Promise<{ sent: number; skipped: number; failed: number }> {
  const out = { sent: 0, skipped: 0, failed: 0 };
  if (!process.env.RESEND_API_KEY) return out;
  const db = createAdminClient();
  const { data: found } = await db.from('reports').select('*, files:report_files(*)').eq('id', reportId).eq('published', true).maybeSingle();
  const report = found as (Report & { files?: ReportFile[] }) | null;
  if (!report || report.placeholder || !hasGatedPack(report.files)) return out;
  const { data: rows, error } = await db.from('pack_reservations').select('*').eq('report_id', reportId).is('fulfilled_at', null).is('closed_at', null).order('created_at', { ascending: true }).limit(200);
  if (error) { console.error('[reservations] list', error); return out; }
  const files = readerFiles(report.files).sort((a, b) => a.sort_order - b.sort_order).map((f) => f.label);
  for (const r of (rows ?? []) as PackReservation[]) {
    if (!r.consent) { out.skipped++; continue; }
    // Claim the reservation first, so a second job running at the same moment cannot email the same reader.
    const { data: claimed } = await db.from('pack_reservations').update({ fulfilled_at: new Date().toISOString() }).eq('id', r.id).is('fulfilled_at', null).is('closed_at', null).select('id');
    if (!claimed || claimed.length === 0) { out.skipped++; continue; }
    try {
      const { token, hash, expiresAt } = newToken();
      const { data: ar, error: insErr } = await db.from('access_requests').insert({
        report_id: report.id, full_name: r.full_name, email: r.email, organisation: r.organisation || 'Not given', role: null, intended_use: 'Reserved before publication',
        consent: true, token_hash: hash, expires_at: expiresAt.toISOString(),
      }).select('id').single();
      if (insErr) throw new Error(insErr.message);
      const expires = expiresAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
      const sent = await sendFromSite('research', (from) => resend().emails.send({
        from, to: r.email, replyTo: leadsAddress(),
        subject: `Your research pack has landed: ${report.title}`,
        html: buildPackEmail({ name: r.full_name, studyTitle: report.title, link: `${SITE}/research/pack/${token}`, expires, files, replyTo: leadsAddress(), reserved: true }),
      }));
      if (sent.error) throw new Error(String((sent.error as { message?: string }).message ?? 'send failed'));
      await db.from('pack_reservations').update({ access_request_id: ar.id }).eq('id', r.id);
      out.sent++;
    } catch (e) {
      console.error('[reservations] fulfil', r.email, e); out.failed++;
      // Release the claim so the next run tries again.
      await db.from('pack_reservations').update({ fulfilled_at: null }).eq('id', r.id);
    }
  }
  if (out.sent) {
    try {
      await sendFromSite('website', (from) => resend().emails.send({
        from, to: leadsAddress(), subject: `Reserved packs sent: ${report.title} (${out.sent})`,
        text: `${out.sent} reader${out.sent === 1 ? '' : 's'} who reserved the ${placeOf(report)} pack for ${weekOf(report)} ${out.sent === 1 ? 'has' : 'have'} been emailed the link. Each one is under Pack requests in the admin.`,
      }));
    } catch { /* the readers have their packs; the admin shows them */ }
  }
  return out;
}

/** The daily sweep: any study published since a reservation was made, whose reservations have not yet been sent. */
export async function fulfilPendingReservations(): Promise<{ reports: number; sent: number; failed: number }> {
  const out = { reports: 0, sent: 0, failed: 0 };
  const db = createAdminClient();
  const { data, error } = await db.from('pack_reservations').select('report_id').is('fulfilled_at', null).is('closed_at', null);
  if (error) { console.error('[reservations] sweep', error); return out; }
  const ids = Array.from(new Set((data ?? []).map((r) => r.report_id as string)));
  for (const id of ids) {
    const r = await fulfilReservations(id);
    if (r.sent || r.failed) out.reports++;
    out.sent += r.sent; out.failed += r.failed;
  }
  return out;
}

/** Tells every open reservation on a closed placeholder that no study was produced that week. Returns how many were emailed. */
export async function closeReservations(report: ReportLite): Promise<number> {
  const db = createAdminClient();
  const { data: rows } = await db.from('pack_reservations').select('*').eq('report_id', report.id).is('fulfilled_at', null).is('closed_at', null).limit(200);
  const list = (rows ?? []) as PackReservation[];
  if (!list.length) return 0;
  const signalUrl = await signalUrlFor(report);
  let n = 0;
  for (const r of list) {
    // Claim first: a reservation is closed, and its reader emailed, once.
    const { data: claimed } = await db.from('pack_reservations').update({ closed_at: new Date().toISOString() }).eq('id', r.id).is('fulfilled_at', null).is('closed_at', null).select('id');
    if (!claimed || claimed.length === 0) continue;
    if (process.env.RESEND_API_KEY && r.consent) {
      const mail = buildNoStudyEmail({ name: r.full_name, territory: placeOf(report), weekText: weekOf(report), signalUrl, libraryUrl: `${SITE}/research/library`, replyTo: leadsAddress() });
      const sent = await sendFromSite('research', (from) => resend().emails.send({ from, to: r.email, replyTo: leadsAddress(), ...mail }));
      if (sent.error) { console.error('[reservations] close', r.email, sent.error); await db.from('pack_reservations').update({ closed_at: null }).eq('id', r.id); continue; }
    }
    n++;
  }
  return n;
}
