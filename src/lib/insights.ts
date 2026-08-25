import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'insights');

export type Insight = {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  draft: boolean;
  ogImage: string | null;
  body: string;
};

export async function getAllInsights(
  { includeDrafts = false }: { includeDrafts?: boolean } = {},
): Promise<Insight[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(CONTENT_DIR);
  } catch {
    return [];
  }

  const insights: Insight[] = [];
  for (const entry of entries) {
    if (!entry.endsWith('.mdx')) continue;
    const raw = await fs.readFile(path.join(CONTENT_DIR, entry), 'utf8');
    const { data, content } = matter(raw);
    const slug = entry.replace(/\.mdx$/, '');
    insights.push({
      slug,
      title: String(data.title ?? slug),
      summary: String(data.summary ?? ''),
      publishedAt: data.publishedAt ? String(data.publishedAt) : '',
      draft: Boolean(data.draft ?? false),
      ogImage: data.ogImage ? String(data.ogImage) : null,
      body: content,
    });
  }

  const filtered = includeDrafts ? insights : insights.filter((i) => !i.draft);
  return filtered.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export async function getInsightBySlug(slug: string): Promise<Insight | null> {
  const all = await getAllInsights({ includeDrafts: true });
  return all.find((i) => i.slug === slug) ?? null;
}
