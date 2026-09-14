import type { MetadataRoute } from 'next';
import { getAllScans, getAllStudies } from '@/lib/content';
import { services, situations } from '@/content/site';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://falconbp.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes = [
    '', '/decision-support-system', '/situations', '/research', '/research/weekly-scan', '/research/studies',
    '/bespoke-managed-services', '/about', '/working-with-falconbridge', '/contact', '/terms-of-engagement', '/privacy-policy',
    ...services.map((s) => `/decision-support-system/${s.slug}`),
    ...situations.map((s) => `/situations/${s.slug}`),
  ];
  const entries: MetadataRoute.Sitemap = staticRoutes.map((p) => ({ url: `${SITE_URL}${p}`, lastModified: now, changeFrequency: 'monthly' }));
  const scans = await getAllScans();
  entries.push(...scans.map((s) => ({ url: `${SITE_URL}/research/weekly-scan/${s.slug}`, lastModified: s.weekOf ? new Date(s.weekOf) : now, changeFrequency: 'yearly' as const })));
  const studies = await getAllStudies();
  entries.push(...studies.map((s) => ({ url: `${SITE_URL}/research/studies/${s.slug}`, lastModified: s.publishedAt ? new Date(s.publishedAt) : now, changeFrequency: 'yearly' as const })));
  return entries;
}
