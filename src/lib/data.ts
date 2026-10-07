import 'server-only';
import { createAdminClient, supabaseConfigured } from '@/lib/supabase/admin';
import type { SignalContent } from '@/lib/weekly/manifest';

/** open = anyone may download · request = in the pack, behind the email form · internal = never shown or served. */
export type FileAccess = 'open' | 'request' | 'internal';
export const FILE_ACCESS: { value: FileAccess; label: string }[] = [
  { value: 'request', label: 'In the pack — behind the email form' },
  { value: 'open', label: 'Open download' },
  { value: 'internal', label: 'Internal — never shown' },
];
export type ReportFile = { id: string; report_id: string; label: string; sort_order: number; storage_path: string | null; access: FileAccess; size_bytes: number | null; source_ref?: string | null; file_name?: string | null };
export type Report = {
  id: string; slug: string; title: string; subtitle: string | null; kind: 'study' | 'sample' | 'paper'; territory: string; year: number | null;
  published_at: string | null; cover_path: string | null; extract_path: string | null; extract_note: string | null; qualifier: string | null;
  body: string | null; facts: { figure: string; body: string }[]; featured: boolean; published: boolean; files?: ReportFile[];
  week_label?: string | null;
};
export type Scan = {
  id: string; slug: string; title: string; territory: string; service: string; week_of: string; signal: string; question: string;
  finding: string | null; interpretation: string | null; open_questions: string[]; reviewed: boolean; sample: boolean; published: boolean;
  week_label?: string | null; report_id?: string | null;
  /** The Weekly Signal as issued (see src/lib/weekly/manifest.ts). When present, the scan page shows it as written. */
  content?: SignalContent | null;
};
export type AccessRequest = {
  id: string; report_id: string; full_name: string; email: string; organisation: string; role: string | null; intended_use: string | null;
  consent: boolean; expires_at: string; first_opened_at: string | null; last_opened_at: string | null; open_count: number; download_count: number; created_at: string;
};
export type SiteSettings = { featured_report_id: string | null; portraits: Record<string, string> };
export type PartnerRow = {
  id: string; slug: string; name: string; title: string; short_title: string | null; location: string | null; location_short: string | null;
  email: string | null; phone: string | null; phone_label: string | null; linkedin: string | null; qualification: string | null; emphasis: string | null;
  sections: { title: string; body: string }[]; portrait_path: string | null; territories: string[]; founder: boolean; sort_order: number; active: boolean;
};

export type TeamMember = { id: string; slug: string; name: string; role: string; location: string | null; email: string | null; linkedin: string | null; bio: string | null; portrait_path: string | null; sort_order: number; active: boolean };
export const PUBLIC_MEDIA = 'public-media';
export const RESEARCH_FILES = 'research-files';

export const territoryName: Record<string, string> = {
  'uae-gcc': 'UAE / GCC', 'south-africa': 'South Africa', 'new-zealand': 'New Zealand', mauritius: 'Mauritius', 'north-carolina': 'North Carolina', singapore: 'Singapore',
  // Studies that belong to no single territory. It is a category for the library, not a place on the map.
  global: 'Global',
  // Studies about the United States as a whole, as distinct from the North Carolina territory.
  usa: 'USA',
};
export const TERRITORIES = Object.entries(territoryName).map(([value, label]) => ({ value, label }));
export const SERVICES = [
  { value: 'ceaas', label: 'CEaaS · Critical Evaluation' }, { value: 'raas', label: 'RaaS · Research' }, { value: 'caas', label: 'CaaS · Coaching' },
  { value: 'emaas', label: 'EMaaS · Execution Modelling' }, { value: 'aaas', label: 'AaaS · Advisory' }, { value: 'none', label: 'None / general' },
];
export const REPORT_KINDS = [{ value: 'study', label: 'Public study' }, { value: 'sample', label: 'Commissioned sample' }, { value: 'paper', label: 'White paper' }];

/** A web-sized copy of an image sits beside it: extracts/abc.png → extracts/abc.thumb.webp. */
export const thumbPathOf = (path: string) => path.replace(/\.[a-z0-9]+$/i, '.thumb.webp');

/** Public URL for an object in public-media (or null). */
export function publicMediaUrl(path: string | null | undefined): string | null {
  if (!path || !process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${PUBLIC_MEDIA}/${path}`;
}

const safe = async <T,>(fn: () => Promise<T>, fallback: T): Promise<T> => {
  if (!supabaseConfigured()) return fallback;
  try { return await fn(); } catch (e) { console.error('[data]', e); return fallback; }
};

export async function getPublishedReports(): Promise<Report[]> {
  return safe(async () => {
    const db = createAdminClient();
    const { data, error } = await db.from('reports').select('*').eq('published', true).order('published_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Report[];
  }, []);
}

export async function getReportBySlug(slug: string, { includeUnpublished = false } = {}): Promise<Report | null> {
  return safe(async () => {
    const db = createAdminClient();
    let q = db.from('reports').select('*, files:report_files(*)').eq('slug', slug);
    if (!includeUnpublished) q = q.eq('published', true);
    const { data, error } = await q.maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const r = data as Report;
    r.files = (r.files ?? []).sort((a, b) => a.sort_order - b.sort_order);
    return r;
  }, null);
}

export async function getFeaturedReport(): Promise<Report | null> {
  return safe(async () => {
    const db = createAdminClient();
    const { data: s } = await db.from('site_settings').select('featured_report_id').eq('id', 1).maybeSingle();
    if (s?.featured_report_id) {
      const { data } = await db.from('reports').select('*').eq('id', s.featured_report_id).eq('published', true).maybeSingle();
      if (data) return data as Report;
    }
    const { data } = await db.from('reports').select('*').eq('published', true).order('featured', { ascending: false }).order('published_at', { ascending: false }).limit(1).maybeSingle();
    return (data as Report) ?? null;
  }, null);
}

export async function getPublishedScans(territory?: string): Promise<Scan[]> {
  return safe(async () => {
    const db = createAdminClient();
    let q = db.from('scans').select('*').eq('published', true).order('week_of', { ascending: false });
    if (territory) q = q.eq('territory', territory);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as Scan[];
  }, []);
}

export async function getScanBySlug(slug: string, { includeUnpublished = false } = {}): Promise<Scan | null> {
  return safe(async () => {
    const db = createAdminClient();
    let q = db.from('scans').select('*').eq('slug', slug);
    if (!includeUnpublished) q = q.eq('published', true);
    const { data, error } = await q.maybeSingle();
    if (error) throw error;
    return (data as Scan) ?? null;
  }, null);
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return safe(async () => {
    const db = createAdminClient();
    const { data } = await db.from('site_settings').select('featured_report_id, portraits').eq('id', 1).maybeSingle();
    return { featured_report_id: data?.featured_report_id ?? null, portraits: (data?.portraits as Record<string, string>) ?? {} };
  }, { featured_report_id: null, portraits: {} });
}

/** Signed URL for a package file. `download` sets the name the reader's copy is saved under. */
export async function signedFileUrl(path: string, opts: { expiresIn?: number; download?: string | null } = {}): Promise<string | null> {
  return safe(async () => {
    const db = createAdminClient();
    const { data, error } = await db.storage.from(RESEARCH_FILES).createSignedUrl(path, opts.expiresIn ?? 3600, opts.download ? { download: opts.download } : undefined);
    if (error) throw error;
    return data.signedUrl;
  }, null);
}

/** The files a reader may ever see: uploaded, and not internal. */
export const readerFiles = (files: ReportFile[] | undefined) => (files ?? []).filter((f) => f.storage_path && f.access !== 'internal');
/** True when the pack can be released automatically: at least one uploaded file sits behind the email form. */
export const hasGatedPack = (files: ReportFile[] | undefined) => (files ?? []).some((f) => f.storage_path && f.access === 'request');

/** The published study a scan led to (or null). Tolerates a database that predates the weekly pipeline. */
export async function getStudyForScan(scan: Scan): Promise<Pick<Report, 'slug' | 'title' | 'subtitle'> | null> {
  if (!scan.report_id) return null;
  return safe(async () => {
    const db = createAdminClient();
    const { data } = await db.from('reports').select('slug, title, subtitle').eq('id', scan.report_id!).eq('published', true).maybeSingle();
    return (data as Pick<Report, 'slug' | 'title' | 'subtitle'>) ?? null;
  }, null);
}

/** The published scan entry behind a study (or null). */
export async function getScanForStudy(reportId: string): Promise<Pick<Scan, 'slug' | 'question' | 'week_of' | 'territory' | 'week_label'> | null> {
  return safe(async () => {
    const db = createAdminClient();
    const { data, error } = await db.from('scans').select('slug, question, week_of, territory, week_label').eq('report_id', reportId).eq('published', true).order('week_of', { ascending: false }).limit(1).maybeSingle();
    if (error) return null;
    return (data as Pick<Scan, 'slug' | 'question' | 'week_of' | 'territory' | 'week_label'>) ?? null;
  }, null);
}

/** The weeks present in a set of rows, newest first, as filter options. */
export function weekOptions(rows: { week_label?: string | null }[]): { value: string; label: string }[] {
  const seen = Array.from(new Set(rows.map((r) => r.week_label).filter((w): w is string => Boolean(w))));
  return seen.sort((a, b) => (a < b ? 1 : -1)).map((value) => ({ value, label: weekText(value) ?? value }));
}

/** "2026-W41" → "Week 41, 2026". */
export const weekText = (label: string | null | undefined) => {
  const m = /^(\d{4})-W(\d{2})$/.exec(label ?? '');
  return m ? `Week ${Number(m[2])}, ${m[1]}` : null;
};

/** Active partners in display order. Empty when the partners table has not been created yet — callers fall back to the built-in list. */
export async function getPartners({ includeInactive = false } = {}): Promise<PartnerRow[]> {
  return safe(async () => {
    const db = createAdminClient();
    let q = db.from('partners').select('*').order('sort_order');
    if (!includeInactive) q = q.eq('active', true);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as PartnerRow[];
  }, []);
}

export async function getTeam({ includeInactive = false } = {}): Promise<TeamMember[]> {
  return safe(async () => {
    const db = createAdminClient();
    let q = db.from('team_members').select('*').order('sort_order');
    if (!includeInactive) q = q.eq('active', true);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as TeamMember[];
  }, []);
}
