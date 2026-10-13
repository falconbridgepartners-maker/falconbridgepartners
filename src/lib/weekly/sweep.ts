import type { ManifestEntry, SignalContent, SignalItem } from '@/lib/weekly/manifest';

/**
 * The sweep every entry passes before the server job publishes it.
 * It catches faults of form (a garbled character, an email wrapper left in, an empty section).
 * It cannot judge whether a figure is true; that check is made by a person or by the scheduled review.
 * Anything it finds holds the entry back and is reported. Nothing is rewritten here except the known footer lines.
 */

/** Lines from the email wrapper that are not part of the issued signal. */
const FOOTER_LINE = /(strictly for internal use|^prepared by\b|falconbridge partners fzc|ajman free zone|^\s*falconbp\.com\s*$|^\s*\|?\s*www\.)/i;
export const isFooterLine = (s: string) => FOOTER_LINE.test(s.trim());

const PHONE = /(\+\d[\d\s().-]{8,}\d)/;
const GARBLE = /(Ã.|â€|ï¿½|�|\[BLOCKED\]|\bundefined\b|\bnull\b|\bNaN\b)/;
const WRAPPER = /(^from:|^to:|^sent:|^subject:|unsubscribe|view in browser)/im;
// A currency amount whose number has gone missing, e.g. "$.2tn", "(62 billion)" after a lost "$", or "$ tn".
const LOST_FIGURE = /(\$\s?\.\d|\$\s?(tn|bn|m)\b|\$\s?,\d|\(\s?\d+(\.\d+)?\s?(billion|trillion|million)\s?\))/i;

export type Finding = { territory: string; where: string; problem: string };

function textsOf(c: SignalContent): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  const item = (label: string, it?: SignalItem) => {
    if (!it) return;
    out.push([`${label} title`, it.title], [`${label} body`, it.body]);
    if (it.lens) out.push([`${label} lens`, it.lens]);
    if (it.sources) out.push([`${label} sources`, it.sources]);
  };
  out.push(['heading', c.heading]);
  if (c.briefing) out.push(['briefing', c.briefing]);
  c.themes?.forEach((t, i) => item(`theme ${i + 1}`, t));
  item('lead', c.lead);
  if (c.watch) out.push(['one to watch', c.watch]);
  c.audit_log?.forEach((l, i) => out.push([`audit log ${i + 1}`, l]));
  return out;
}

/** Returns the entry with footer lines removed from the audit log, plus anything that must stop it publishing. */
export function sweepEntry(entry: ManifestEntry, weekLabel: string): { entry: ManifestEntry; findings: Finding[] } {
  const findings: Finding[] = [];
  const add = (where: string, problem: string) => findings.push({ territory: entry.territory, where, problem });
  const s = entry.scan;
  let out = entry;

  if (s) {
    const c = s.content;
    if (!c) add('scan', 'No signal content: the scan would publish without the signal as issued.');
    else {
      if (c.format !== 'weekly-signal-v1') add('scan', 'Unknown signal format.');
      const cleaned: SignalContent = { ...c, audit_log: (c.audit_log ?? []).filter((l) => !isFooterLine(l)) };
      out = { ...entry, scan: { ...s, content: cleaned } };
      if (!c.lead?.title || !c.lead?.body) add('lead topic', 'Lead topic is missing its title or body.');
      if (!c.themes || c.themes.length === 0) add('themes', 'No themes.');
      if (!c.watch) add('one to watch', 'Missing.');
      if (!c.audit_log || cleaned.audit_log!.length === 0) add('audit log', 'Empty.');
      for (const [where, t] of textsOf(cleaned)) {
        if (!t || !t.trim()) { add(where, 'Empty.'); continue; }
        if (GARBLE.test(t)) add(where, `Garbled text: "${t.match(GARBLE)![0]}".`);
        if (PHONE.test(t)) add(where, 'Contains a phone number.');
        if (WRAPPER.test(t)) add(where, 'Email wrapper text left in.');
        if (LOST_FIGURE.test(t)) add(where, `A figure looks cut off: "${t.match(LOST_FIGURE)![0]}".`);
        if (isFooterLine(t) && !where.startsWith('audit log')) add(where, 'Footer or credit line left in.');
      }
    }
    const wk = s.slug.match(/-week-(\d+)-/)?.[1];
    const lbl = weekLabel.match(/W0*(\d+)/i)?.[1];
    if (wk && lbl && wk !== lbl) add('scan slug', `Slug says week ${wk} but the manifest is ${weekLabel}.`);
    if (s.signal !== c?.lead?.body && c) add('scan', 'The signal field does not match the lead body.');
  }
  if (entry.piece && !entry.piece.content?.headline?.trim()) add('piece', 'No headline.');
  if (entry.report && !entry.report.title && !entry.report.body) add('study', 'No title or body.');
  return { entry: out, findings };
}
