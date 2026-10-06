/**
 * The weekly manifest: one JSON file per week that says what goes on the site.
 *
 * It carries the public copy for each territory's Weekly Scan entry and study page, and points at the
 * pack files in Dropbox by their file id. The importer in /admin reads it, copies the files into private
 * storage and creates the entries. Whoever writes the manifest — a person, Claude, or HT+ — the importer
 * does the same thing with it.
 *
 * This module is pure (no I/O) so the same validation runs in the importer and in tests.
 */

export const MANIFEST_VERSION = 1;

export const TERRITORY_KEYS = ['uae-gcc', 'south-africa', 'new-zealand', 'mauritius', 'north-carolina', 'singapore'] as const;
export const SERVICE_KEYS = ['ceaas', 'raas', 'caas', 'emaas', 'aaas', 'none'] as const;
export const ACCESS_KEYS = ['open', 'request', 'internal'] as const;

/** The six package slots, in the order the study page and the admin form show them. */
export const SLOTS = [
  { slot: 1, label: 'User guide', access: 'request' },
  { slot: 2, label: 'Executive deck', access: 'request' },
  { slot: 3, label: 'Full research report', access: 'request' },
  { slot: 4, label: 'Executive summary', access: 'open' },
  { slot: 5, label: 'Executive visual', access: 'open' },
  { slot: 6, label: 'Reference and link audit', access: 'internal' },
] as const;

export type ManifestAccess = (typeof ACCESS_KEYS)[number];
export type ManifestFile = { slot: number; label?: string; access?: ManifestAccess; dropbox: string; name?: string };
export type ManifestScan = {
  slug: string; title: string; service?: string; week_of: string; signal: string; question: string;
  finding?: string; interpretation?: string; open_questions?: string[];
};
export type ManifestReport = {
  slug: string; title: string; subtitle?: string; kind?: 'study' | 'sample' | 'paper'; year?: number; published_at?: string;
  body?: string; facts?: { figure: string; body: string }[]; extract_note?: string; qualifier?: string;
  /** Dropbox references to images: the Executive Visual as PNG/JPEG (shown on the study page) and an optional 3:4 cover. */
  extract_image?: string; cover_image?: string;
};
export type ManifestEntry = { territory: string; scan?: ManifestScan; report?: ManifestReport; files?: ManifestFile[] };
export type WeeklyManifest = {
  version: number; week_label: string; review_period?: { from: string; to: string }; prepared_by?: string; notes?: string;
  entries: ManifestEntry[];
};

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const WEEK = /^\d{4}-W\d{2}$/;
/** A Dropbox file id, or an absolute display path. Ids survive renames and moves, so they are preferred. */
const DBX_REF = /^(id:[A-Za-z0-9_-]+|\/.+)$/;

const isStr = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

/** Returns the list of problems; empty means the manifest can be imported. */
export function validateManifest(input: unknown): string[] {
  const errs: string[] = [];
  const m = input as Partial<WeeklyManifest> | null;
  if (!m || typeof m !== 'object') return ['The manifest is not a JSON object.'];
  if (m.version !== MANIFEST_VERSION) errs.push(`version must be ${MANIFEST_VERSION}.`);
  if (!isStr(m.week_label) || !WEEK.test(m.week_label)) errs.push('week_label must look like 2026-W41.');
  if (m.review_period && (!DATE.test(m.review_period.from ?? '') || !DATE.test(m.review_period.to ?? ''))) errs.push('review_period dates must be YYYY-MM-DD.');
  if (!Array.isArray(m.entries) || m.entries.length === 0) return [...errs, 'entries must list at least one territory.'];
  if (m.entries.length > 12) errs.push('entries: at most 12 per manifest.');

  const seenScan = new Set<string>(), seenReport = new Set<string>();
  m.entries.forEach((e, i) => {
    const at = `entries[${i}]${isStr(e?.territory) ? ` (${e.territory})` : ''}`;
    if (!e || typeof e !== 'object') { errs.push(`${at}: not an object.`); return; }
    if (!(TERRITORY_KEYS as readonly string[]).includes(e.territory)) errs.push(`${at}: territory must be one of ${TERRITORY_KEYS.join(', ')}.`);
    if (!e.scan && !e.report) errs.push(`${at}: needs a scan, a report, or both.`);

    if (e.scan) {
      const s = e.scan;
      if (!isStr(s.slug) || !SLUG.test(s.slug) || s.slug.length > 80) errs.push(`${at}.scan.slug: lower-case letters, digits and hyphens, 80 characters at most.`);
      else if (seenScan.has(s.slug)) errs.push(`${at}.scan.slug: "${s.slug}" is used twice.`); else seenScan.add(s.slug);
      if (!isStr(s.title)) errs.push(`${at}.scan.title is required.`);
      if (!isStr(s.week_of) || !DATE.test(s.week_of)) errs.push(`${at}.scan.week_of must be YYYY-MM-DD.`);
      if (!isStr(s.signal)) errs.push(`${at}.scan.signal is required.`);
      if (!isStr(s.question)) errs.push(`${at}.scan.question is required.`);
      if (s.service && !(SERVICE_KEYS as readonly string[]).includes(s.service)) errs.push(`${at}.scan.service must be one of ${SERVICE_KEYS.join(', ')}.`);
      if (s.open_questions && (!Array.isArray(s.open_questions) || s.open_questions.some((q) => !isStr(q)))) errs.push(`${at}.scan.open_questions must be a list of sentences.`);
    }

    if (e.report) {
      const r = e.report;
      if (!isStr(r.slug) || !SLUG.test(r.slug) || r.slug.length > 80) errs.push(`${at}.report.slug: lower-case letters, digits and hyphens, 80 characters at most.`);
      else if (seenReport.has(r.slug)) errs.push(`${at}.report.slug: "${r.slug}" is used twice.`); else seenReport.add(r.slug);
      if (!isStr(r.title)) errs.push(`${at}.report.title is required.`);
      if (r.kind && !['study', 'sample', 'paper'].includes(r.kind)) errs.push(`${at}.report.kind must be study, sample or paper.`);
      if (r.published_at && !DATE.test(r.published_at)) errs.push(`${at}.report.published_at must be YYYY-MM-DD.`);
      if (r.facts && (!Array.isArray(r.facts) || r.facts.length > 3 || r.facts.some((f) => !f || !isStr(f.figure) || !isStr(f.body)))) errs.push(`${at}.report.facts: up to three {figure, body} pairs.`);
      for (const k of ['extract_image', 'cover_image'] as const) if (r[k] && !DBX_REF.test(r[k]!)) errs.push(`${at}.report.${k} must be a Dropbox id (id:…) or an absolute path.`);
    }

    if (e.files) {
      if (!e.report) errs.push(`${at}: files need a report to attach to.`);
      if (!Array.isArray(e.files)) { errs.push(`${at}.files must be a list.`); return; }
      const slots = new Set<number>();
      e.files.forEach((f, j) => {
        const fa = `${at}.files[${j}]`;
        if (!f || !Number.isInteger(f.slot) || f.slot < 1 || f.slot > SLOTS.length) { errs.push(`${fa}.slot must be 1–${SLOTS.length}.`); return; }
        if (slots.has(f.slot)) errs.push(`${fa}: slot ${f.slot} is used twice.`); else slots.add(f.slot);
        if (!isStr(f.dropbox) || !DBX_REF.test(f.dropbox)) errs.push(`${fa}.dropbox must be a Dropbox id (id:…) or an absolute path.`);
        if (f.access && !(ACCESS_KEYS as readonly string[]).includes(f.access)) errs.push(`${fa}.access must be open, request or internal.`);
      });
    }
  });
  return errs;
}

export function parseManifest(json: string): { manifest?: WeeklyManifest; errors: string[] } {
  let raw: unknown;
  try { raw = JSON.parse(json); } catch (e) { return { errors: [`Not valid JSON: ${e instanceof Error ? e.message : String(e)}`] }; }
  const errors = validateManifest(raw);
  return errors.length ? { errors } : { manifest: raw as WeeklyManifest, errors: [] };
}

/** What the import screen shows for each territory before anything is written. */
export type EntryPreview = {
  index: number; territory: string; scanSlug?: string; scanTitle?: string; reportSlug?: string; reportTitle?: string;
  files: { slot: number; label: string; access: ManifestAccess }[];
};

export function previewEntries(m: WeeklyManifest): EntryPreview[] {
  return m.entries.map((e, index) => ({
    index, territory: e.territory, scanSlug: e.scan?.slug, scanTitle: e.scan?.title, reportSlug: e.report?.slug, reportTitle: e.report?.title,
    files: (e.files ?? []).slice().sort((a, b) => a.slot - b.slot).map((f) => {
      const d = SLOTS[f.slot - 1];
      return { slot: f.slot, label: f.label || d.label, access: (f.access ?? d.access) as ManifestAccess };
    }),
  }));
}
