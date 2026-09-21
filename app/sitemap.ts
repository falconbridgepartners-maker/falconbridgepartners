import type { MetadataRoute } from 'next';
import { getPublishedScans, getPublishedReports } from '@/lib/data';
import { services, situations } from '@/content/site';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://falconbp.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes = [
    '', '/decision-support-system', '/situations', '/research', '/research/weekly-scan', '/research/library',
    '/bespoke-managed-services', '/about', '/working-with-falconbridge', '/contact', '/terms-of-engagement', '/privacy-policy',
    ...services.map((s) => `/decision-support-system/${s.slug}`),
    ...situations.map((s) => `/situations/${s.slug}`),
  ];
  const entries: MetadataRoute.Sitemap = staticRoutes.map((p) => ({ url: `${SITE_URL}${p}`, lastModified: now, changeFrequency: 'monthly' }));
  const scans = await getPublishedScans();
  entries.push(...scans.map((s) => ({ url: `${SITE_URL}/research/weekly-scan/${s.slug}`, lastModified: new Date(s.week_of), changeFrequency: 'yearly' as const })));
  const reports = await getPublishedReports();
  entries.push(...reports.map((s) => ({ url: `${SITE_URL}/research/studies/${s.slug}`, lastModified: s.published_at ? new Date(s.published_at) : now, changeFrequency: 'yearly' as const })));
  return entries;
}
