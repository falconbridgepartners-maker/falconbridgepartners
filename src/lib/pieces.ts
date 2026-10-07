/**
 * Professional Curiosity pieces: short opinion pieces drawn from our own-account studies.
 *
 * A piece is carried exactly as issued. Its content is a small structure (headline, body blocks, stat
 * tiles, numbered callouts, numbered questions, closing disclaimer) and the site shows it as written;
 * nothing here rewrites or summarises it.
 *
 * This module is pure (no I/O) so the same validation runs in the importer, the admin form and tests.
 */

export const PIECE_FORMAT = 'professional-curiosity-v1';
export const PIECE_SERIES = 'Professional Curiosity Series';

/** A figure with the line that explains it. `highlight` marks the tile the piece sets apart (the finding). */
export type PieceStat = { figure: string; label: string; highlight?: boolean };
/** One numbered callout: an optional short title and its text. */
export type PieceItem = { title?: string; body: string };

/**
 * The body is a list of blocks in reading order. Text may mark emphasis the way the piece was issued:
 * **bold**, *italic* and [a link](https://…). Nothing else is interpreted.
 */
export type PieceBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'lead'; text: string }       // a paragraph the piece sets larger and bold: its central finding
  | { type: 'note'; text: string }       // a boxed aside, such as the line that explains the series
  | { type: 'heading'; text: string }
  | { type: 'stats'; items: PieceStat[]; caption?: string }   // caption: the base line printed under the tiles
  | { type: 'callouts'; heading?: string; items: PieceItem[] }
  | { type: 'questions'; heading?: string; items: string[] }
  | { type: 'list'; items: string[] }
  | { type: 'quote'; text: string; attribution?: string };

export type PieceContent = {
  format: typeof PIECE_FORMAT;
  series?: string;            // defaults to "Professional Curiosity Series"
  headline: string;           // the full headline, as issued
  headline_accent?: string;   // the closing part of the headline that is set in gold; must end the headline
  byline?: string;            // the byline as issued; composed from the dates when absent
  standfirst?: string;        // an opening line set apart from the body
  blocks: PieceBlock[];
  request_note?: string;      // the line printed under the "Request the full study" button
  disclaimer?: string;        // the closing disclaimer, as issued
};

const isStr = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const optStr = (v: unknown) => v === undefined || v === null || typeof v === 'string';
const BLOCK_TYPES = ['paragraph', 'lead', 'note', 'heading', 'stats', 'callouts', 'questions', 'list', 'quote'] as const;

/** Adds the problems found in a piece's content to `errs`. `at` names where it sits, for the message. */
export function validatePieceContent(c: unknown, at: string, errs: string[]): void {
  const x = c as Partial<PieceContent> | null;
  if (!x || typeof x !== 'object') { errs.push(`${at}: not an object.`); return; }
  if (x.format !== PIECE_FORMAT) errs.push(`${at}.format must be "${PIECE_FORMAT}".`);
  if (!isStr(x.headline)) errs.push(`${at}.headline is required.`);
  for (const k of ['series', 'headline_accent', 'byline', 'standfirst', 'request_note', 'disclaimer'] as const) if (!optStr(x[k])) errs.push(`${at}.${k} must be text.`);
  if (isStr(x.headline) && isStr(x.headline_accent) && !x.headline.trim().endsWith(x.headline_accent.trim())) errs.push(`${at}.headline_accent must be the closing words of the headline.`);
  if (!Array.isArray(x.blocks) || x.blocks.length === 0) { errs.push(`${at}.blocks must list at least one block.`); return; }
  if (x.blocks.length > 200) errs.push(`${at}.blocks: at most 200.`);
  x.blocks.forEach((b, i) => {
    const ba = `${at}.blocks[${i}]`;
    const blk = b as { type?: string; text?: unknown; heading?: unknown; caption?: unknown; attribution?: unknown; items?: unknown } | null;
    if (!blk || typeof blk !== 'object' || !(BLOCK_TYPES as readonly string[]).includes(blk.type ?? '')) { errs.push(`${ba}.type must be one of ${BLOCK_TYPES.join(', ')}.`); return; }
    if (blk.type === 'paragraph' || blk.type === 'lead' || blk.type === 'note' || blk.type === 'heading' || blk.type === 'quote') {
      if (!isStr(blk.text)) errs.push(`${ba}.text is required.`);
      if (blk.type === 'quote' && !optStr(blk.attribution)) errs.push(`${ba}.attribution must be text.`);
      return;
    }
    if (!optStr(blk.heading)) errs.push(`${ba}.heading must be text.`);
    if (!optStr(blk.caption)) errs.push(`${ba}.caption must be text.`);
    if (!Array.isArray(blk.items) || blk.items.length === 0) { errs.push(`${ba}.items must list at least one item.`); return; }
    if (blk.items.length > 24) errs.push(`${ba}.items: at most 24.`);
    blk.items.forEach((it, j) => {
      const ia = `${ba}.items[${j}]`;
      if (blk.type === 'stats') {
        const s = it as Partial<PieceStat> | null;
        if (!s || !isStr(s.figure) || !isStr(s.label)) errs.push(`${ia} needs a figure and a label.`);
      } else if (blk.type === 'callouts') {
        const s = it as Partial<PieceItem> | null;
        if (!s || !isStr(s.body) || !optStr(s.title)) errs.push(`${ia} needs a body (and may have a title).`);
      } else if (!isStr(it)) errs.push(`${ia} must be a line of text.`);
    });
  });
}

/** Returns the list of problems in a piece's content; empty means it can be shown. */
export function pieceContentErrors(c: unknown): string[] {
  const errs: string[] = [];
  validatePieceContent(c, 'content', errs);
  return errs;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const parts = (iso: string | null | undefined) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? '');
  return m ? { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) } : null;
};
/** "2026-10-07" → "October 2026". */
export const monthYear = (iso: string | null | undefined) => { const p = parts(iso); return p && MONTHS[p.m - 1] ? `${MONTHS[p.m - 1]} ${p.y}` : null; };
/** "2026-09-21" → "21 September 2026". */
export const longDate = (iso: string | null | undefined) => { const p = parts(iso); return p && MONTHS[p.m - 1] ? `${p.d} ${MONTHS[p.m - 1]} ${p.y}` : null; };

/**
 * The byline: the line as issued when the piece carries one, otherwise
 * "FalconBridge Partners · October 2026 · Own-account research, evidence date 21 September 2026".
 */
export function pieceByline(p: { content: PieceContent; published_at?: string | null; evidence_date?: string | null }): string {
  if (isStr(p.content.byline)) return p.content.byline.trim();
  const evidence = longDate(p.evidence_date);
  return ['FalconBridge Partners', monthYear(p.published_at), `Own-account research${evidence ? `, evidence date ${evidence}` : ''}`].filter(Boolean).join(' · ');
}

/** The headline split into its plain part and the closing part set in gold. */
export function headlineParts(c: PieceContent): { lead: string; accent: string | null } {
  const full = c.headline.trim();
  const accent = c.headline_accent?.trim();
  if (accent && full.endsWith(accent) && accent.length < full.length) return { lead: full.slice(0, full.length - accent.length).trimEnd(), accent };
  return { lead: full, accent: null };
}

/** Removes the **bold**, *italic* and [link](…) marks, for places that take plain text (lists, link previews). */
export const plainText = (s: string) => s.replace(/\[([^\]]+)\]\([^)\s]+\)/g, '$1').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');

/** Trims text to whole sentences where it can, otherwise to whole words with an ellipsis. */
export function clip(text: string, max = 220): string {
  const raw = text.replace(/\s+/g, ' ').trim();
  if (raw.length <= max) return raw;
  const cut = raw.slice(0, max);
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '), cut.lastIndexOf('! '));
  return stop > max * 0.5 ? cut.slice(0, stop + 1) : `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:–—-]+$/, '')}…`;
}

/** One or two sentences for lists and link previews: the description if given, else the standfirst, else the first paragraph. */
export function pieceSummary(p: { description?: string | null; content: PieceContent }, max = 220): string {
  const first = p.content.blocks.find((b): b is Extract<PieceBlock, { type: 'paragraph' }> => b.type === 'paragraph');
  return clip(plainText(isStr(p.description) ? p.description : isStr(p.content.standfirst) ? p.content.standfirst : first?.text ?? ''), max);
}
