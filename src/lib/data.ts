import 'server-only';
import { createAdminClient, supabaseConfigured } from '@/lib/supabase/admin';

export type ReportFile = { id: string; report_id: string; label: string; sort_order: number; storage_path: string | null; access: 'open' | 'request'; size_bytes: number | null };
export type Report = {
  id: string; slug: string; title: string; subtitle: string | null; kind: 'study' | 'sample' | 'paper'; territory: string; year: number | null;
  published_at: string | null; cover_path: string | null; extract_path: string | null; extract_note: string | null; qualifier: string | null;
  body: string | null; facts: { figure: string; body: string }[]; featured: boolean; published: boolean; files?: ReportFile[];
};
export type Scan = {
  id: string; slug: string; title: string; territory: string; service: string; week_of: string; signal: string; question: string;
  finding: string | null; interpretation: string | null; open_questions: string[]; reviewed: boolean; sample: boolean; published: boolean;
};
export type SiteSettings = { featured_report_id: string | null; portraits: Record<string, string> };

export const PUBLIC_MEDIA = 'public-media';
export const RESEARCH_FILES = 'research-files';

export const territoryName: Record<string, string> = {
  'uae-gcc': 'UAE / GCC', 'south-africa': 'South Africa', 'new-zealand': 'New Zealand', mauritius: 'Mauritius', 'north-carolina': 'North Carolina', singapore: 'Singapore',
};
export const TERRITORIES = Object.entries(territoryName).map(([value, label]) => ({ value, label }));
export const SERVICES = [
  { value: 'ceaas', label: 'CEaaS · Critical Evaluation' }, { value: 'raas', label: 'RaaS · Research' }, { value: 'caas', label: 'CaaS · Coaching' },
  { value: 'emaas', label: 'EMaaS · Execution Modelling' }, { value: 'aaas', label: 'AaaS · Advisory' }, { value: 'none', label: 'None / general' },
];
export const REPORT_KINDS = [{ value: 'study', label: 'Public study' }, { value: 'sample', label: 'Commissioned sample' }, { value: 'paper', label: 'White paper' }];

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

/** Signed URL for an open package file (1 hour). */
export async function signedFileUrl(path: string): Promise<string | null> {
  return safe(async () => {
    const db = createAdminClient();
    const { data, error } = await db.storage.from(RESEARCH_FILES).createSignedUrl(path, 3600);
    if (error) throw error;
    return data.signedUrl;
  }, null);
}
