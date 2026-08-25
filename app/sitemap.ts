import type { MetadataRoute } from 'next';
import { getAllInsights } from '@/lib/insights';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://falconbp.com';

const STATIC_ROUTES = [
  '',
  '/about',
  '/contact',
  '/how-we-work',
  '/how-we-work/internal-judgement',
  '/how-we-work/external-signal',
  '/how-we-work/execution-reality',
  '/privacy-policy',
  '/terms-of-engagement',
  '/insights',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries = STATIC_ROUTES.map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
  }));

  const insights = await getAllInsights();
  const insightEntries = insights.map((i) => ({
    url: `${SITE_URL}/insights/${i.slug}`,
    lastModified: i.publishedAt ? new Date(i.publishedAt) : now,
    changeFrequency: 'yearly' as const,
  }));

  return [...staticEntries, ...insightEntries];
}
