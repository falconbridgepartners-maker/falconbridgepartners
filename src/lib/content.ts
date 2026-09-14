import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = path.join(process.cwd(), 'content');

export type Scan = {
  slug: string;
  title: string;
  territory: string;
  service: string;
  weekOf: string;
  signal: string;
  question: string;
  finding: string;
  interpretation: string;
  openQuestions: string[];
  sample: boolean;
  draft: boolean;
  body: string;
};

export type Study = {
  slug: string;
  title: string;
  subtitle: string;
  territory: string;
  publishedAt: string;
  facts: { figure: string; body: string }[];
  extractNote: string;
  qualifier: string;
  extractImage: string | null;
  files: { label: string; url: string }[];
  draft: boolean;
  body: string;
};

async function readCollection(dir: string) {
  let entries: string[];
  try {
    entries = await fs.readdir(path.join(ROOT, dir));
  } catch {
    return [];
  }
  const out: { slug: string; data: Record<string, unknown>; content: string }[] = [];
  for (const entry of entries) {
    if (!entry.endsWith('.mdx')) continue;
    const raw = await fs.readFile(path.join(ROOT, dir, entry), 'utf8');
    const { data, content } = matter(raw);
    out.push({ slug: entry.replace(/\.mdx$/, ''), data, content });
  }
  return out;
}

const s = (v: unknown, d = '') => (v == null ? d : String(v));

export async function getAllScans({ includeDrafts = false } = {}): Promise<Scan[]> {
  const rows = await readCollection('scans');
  const scans = rows.map(({ slug, data, content }) => ({
    slug,
    title: s(data.title, slug),
    territory: s(data.territory),
    service: s(data.service, 'none'),
    weekOf: s(data.weekOf),
    signal: s(data.signal),
    question: s(data.question),
    finding: s(data.finding),
    interpretation: s(data.interpretation),
    openQuestions: Array.isArray(data.openQuestions) ? data.openQuestions.map((q) => String(q)) : [],
    sample: Boolean(data.sample),
    draft: Boolean(data.draft),
    body: content,
  }));
  const filtered = includeDrafts ? scans : scans.filter((x) => !x.draft);
  return filtered.sort((a, b) => (a.weekOf < b.weekOf ? 1 : -1));
}

export async function getScanBySlug(slug: string) {
  const all = await getAllScans({ includeDrafts: true });
  return all.find((x) => x.slug === slug) ?? null;
}

export async function getAllStudies({ includeDrafts = false } = {}): Promise<Study[]> {
  const rows = await readCollection('studies');
  const studies = rows.map(({ slug, data, content }) => ({
    slug,
    title: s(data.title, slug),
    subtitle: s(data.subtitle),
    territory: s(data.territory),
    publishedAt: s(data.publishedAt),
    facts: Array.isArray(data.facts) ? (data.facts as { figure: string; body: string }[]) : [],
    extractNote: s(data.extractNote),
    qualifier: s(data.qualifier),
    extractImage: data.extractImage ? s(data.extractImage) : null,
    files: Array.isArray(data.files) ? (data.files as { label: string; url: string }[]) : [],
    draft: Boolean(data.draft),
    body: content,
  }));
  const filtered = includeDrafts ? studies : studies.filter((x) => !x.draft);
  return filtered.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export async function getStudyBySlug(slug: string) {
  const all = await getAllStudies({ includeDrafts: true });
  return all.find((x) => x.slug === slug) ?? null;
}

export const territoryName: Record<string, string> = {
  'uae-gcc': 'UAE / GCC',
  'south-africa': 'South Africa',
  'new-zealand': 'New Zealand',
  mauritius: 'Mauritius',
  'north-carolina': 'North Carolina',
  singapore: 'Singapore',
};
