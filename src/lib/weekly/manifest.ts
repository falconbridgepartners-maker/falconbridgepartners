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
import { validatePieceContent, type PieceContent } from '@/lib/pieces';

export const MANIFEST_VERSION = 1;

/** `global` and `usa` are not in use for now; see HIDDEN_TERRITORIES in src/lib/data.ts. */
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
/** One item of a Weekly Signal, as issued: its headline, text, the FalconBridge Lens and the sources line. */
export type SignalItem = { title: string; body: string; lens?: string; sources?: string };
/**
 * A Weekly Signal carried exactly as issued. When a scan has this, the site shows the signal in its own
 * structure and does not use the finding / interpretation / open-question fields.
 */
export type SignalContent = {
  format: 'weekly-signal-v1';
  heading: string;            // e.g. "Mauritius — Weekly Signal"
  issue?: string;             // e.g. "WEEK#41 / 2026"
  review_period?: string;     // e.g. "28 September – 4 October 2026"
  briefing?: string;          // the opening line: week ending, sources scanned
  themes: SignalItem[];       // "Top 3 themes"
  lead?: SignalItem;          // "Lead topic"
  watch?: string;             // "One to watch"
  audit_log?: string[];       // "Article audit log — sources considered this scan"
};
export type ManifestScan = {
  slug: string; title: string; service?: string; week_of: string; signal: string; question: string;
  finding?: string; interpretation?: string; open_questions?: string[];
  /** The Weekly Signal as issued. `signal` and `question` are still required: lists, feeds and search use them. */
  content?: SignalContent;
};
export type ManifestReport = {
  slug: string; title: string; subtitle?: string; kind?: 'study' | 'sample' | 'paper'; year?: number; published_at?: string;
  body?: string; facts?: { figure: string; body: string }[]; extract_note?: string; qualifier?: string;
  /** Dropbox references to images: the Executive Visual as PNG/JPEG (shown on the study page) and an optional 3:4 cover. */
  extract_image?: string; cover_image?: string;
};
/**
 * A Professional Curiosity piece: the opinion piece drawn from a study, carried exactly as issued.
 * Its headline is `content.headline`. The study behind it is the entry's own `report`, or `study` (a study's slug)
 * when the piece is published on its own after the study is already live.
 */
export type ManifestPiece = {
  slug: string; description?: string; published_at?: string; evidence_date?: string; study?: string;
  /** Dropbox reference to a 1200 × 630 link-preview image. Optional: without it the site draws one from the headline. */
  share_image?: string;
  content: PieceContent;
};
export type ManifestEntry = { territory: string; scan?: ManifestScan; report?: ManifestReport; files?: ManifestFile[]; piece?: ManifestPiece };
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
const optStr = (v: unknown) => v === undefined || v === null || typeof v === 'string';

function validateSignalItem(it: unknown, at: string, errs: string[]) {
  const x = it as Partial<SignalItem> | null;
  if (!x || typeof x !== 'object') { errs.push(`${at}: not an object.`); return; }
  if (!isStr(x.title)) errs.push(`${at}.title is required.`);
  if (!isStr(x.body)) errs.push(`${at}.body is required.`);
  if (!optStr(x.lens)) errs.push(`${at}.lens must be text.`);
  if (!optStr(x.sources)) errs.push(`${at}.sources must be text.`);
}

function validateSignalContent(c: unknown, at: string, errs: string[]) {
  const x = c as Partial<SignalContent> | null;
  if (!x || typeof x !== 'object') { errs.push(`${at}: not an object.`); return; }
  if (x.format !== 'weekly-signal-v1') errs.push(`${at}.format must be "weekly-signal-v1".`);
  if (!isStr(x.heading)) errs.push(`${at}.heading is required.`);
  for (const k of ['issue', 'review_period', 'briefing', 'watch'] as const) if (!optStr(x[k])) errs.push(`${at}.${k} must be text.`);
  if (!Array.isArray(x.themes)) errs.push(`${at}.themes must be a list.`);
  else {
    if (x.themes.length > 12) errs.push(`${at}.themes: at most 12.`);
    x.themes.forEach((t, i) => validateSignalItem(t, `${at}.themes[${i}]`, errs));
  }
  if (x.lead !== undefined && x.lead !== null) validateSignalItem(x.lead, `${at}.lead`, errs);
  if (Array.isArray(x.themes) && x.themes.length === 0 && !x.lead) errs.push(`${at}: needs at least one theme or a lead topic.`);
  if (x.audit_log !== undefined && x.audit_log !== null && (!Array.isArray(x.audit_log) || x.audit_log.some((a) => !isStr(a)))) errs.push(`${at}.audit_log must be a list of lines.`);
}

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

  const seenScan = new Set<string>(), seenReport = new Set<string>(), seenPiece = new Set<string>();
  m.entries.forEach((e, i) => {
    const at = `entries[${i}]${isStr(e?.territory) ? ` (${e.territory})` : ''}`;
    if (!e || typeof e !== 'object') { errs.push(`${at}: not an object.`); return; }
    if (!(TERRITORY_KEYS as readonly string[]).includes(e.territory)) errs.push(`${at}: territory must be one of ${TERRITORY_KEYS.join(', ')}.`);
    if (!e.scan && !e.report && !e.piece) errs.push(`${at}: needs a scan, a report or a piece.`);

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
      if (s.content !== undefined && s.content !== null) validateSignalContent(s.content, `${at}.scan.content`, errs);
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

    if (e.piece) {
      const p = e.piece;
      if (!isStr(p.slug) || !SLUG.test(p.slug) || p.slug.length > 80) errs.push(`${at}.piece.slug: lower-case letters, digits and hyphens, 80 characters at most.`);
      else if (seenPiece.has(p.slug)) errs.push(`${at}.piece.slug: "${p.slug}" is used twice.`); else seenPiece.add(p.slug);
      if (!optStr(p.description)) errs.push(`${at}.piece.description must be text.`);
      for (const k of ['published_at', 'evidence_date'] as const) if (p[k] && !DATE.test(p[k]!)) errs.push(`${at}.piece.${k} must be YYYY-MM-DD.`);
      if (p.study !== undefined && p.study !== null && (!isStr(p.study) || !SLUG.test(p.study))) errs.push(`${at}.piece.study must be the slug of the study behind the piece.`);
      if (p.study && e.report && p.study !== e.report.slug) errs.push(`${at}.piece.study names a different study from this entry's report; give one or the other.`);
      if (p.share_image && !DBX_REF.test(p.share_image)) errs.push(`${at}.piece.share_image must be a Dropbox id (id:…) or an absolute path.`);
      validatePieceContent(p.content, `${at}.piece.content`, errs);
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
  pieceSlug?: string; pieceTitle?: string;
  files: { slot: number; label: string; access: ManifestAccess }[];
};

export function previewEntries(m: WeeklyManifest): EntryPreview[] {
  return m.entries.map((e, index) => ({
    index, territory: e.territory, scanSlug: e.scan?.slug, scanTitle: e.scan?.title, reportSlug: e.report?.slug, reportTitle: e.report?.title,
    pieceSlug: e.piece?.slug, pieceTitle: e.piece?.content?.headline,
    files: (e.files ?? []).slice().sort((a, b) => a.slot - b.slot).map((f) => {
      const d = SLOTS[f.slot - 1];
      return { slot: f.slot, label: f.label || d.label, access: (f.access ?? d.access) as ManifestAccess };
    }),
  }));
}
