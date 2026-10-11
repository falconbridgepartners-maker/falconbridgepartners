import React from 'react';
import { SITE_NAME } from '@/lib/share';

/**
 * Search metadata shared by the public pages: the canonical address of a page, and the structured data
 * (JSON-LD) that tells a search engine what a page is: the firm, an article, the path a reader took to it.
 */

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://falconbp.com';

/** The canonical address for a page, for `alternates` in its metadata. */
export const canonical = (path: string) => ({ canonical: path });

export type Crumb = { name: string; path: string };

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    legalName: 'FalconBridge Partners FZC LLC',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'Research and strategic support for consequential business decisions, combining experienced human judgement with proprietary, AI-assisted methods.',
    areaServed: ['United Arab Emirates', 'South Africa', 'New Zealand', 'Mauritius', 'United States', 'Singapore'],
  };
}

export function websiteLd() {
  return { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: SITE_URL };
}

export function breadcrumbLd(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: `${SITE_URL}${c.path}` })),
  };
}

export function articleLd(a: { headline: string; description?: string | null; path: string; image?: string | null; published?: string | null; modified?: string | null; section?: string }) {
  const image = a.image ? (a.image.startsWith('http') ? a.image : `${SITE_URL}${a.image}`) : undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.headline,
    ...(a.description ? { description: a.description } : {}),
    url: `${SITE_URL}${a.path}`,
    mainEntityOfPage: `${SITE_URL}${a.path}`,
    ...(image ? { image } : {}),
    ...(a.published ? { datePublished: a.published } : {}),
    ...(a.modified ?? a.published ? { dateModified: a.modified ?? a.published } : {}),
    ...(a.section ? { articleSection: a.section } : {}),
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL, logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` } },
  };
}

/** Renders one or more JSON-LD objects. The `<` is escaped so page content can never close the script. */
export function JsonLd({ data }: { data: object | object[] }) {
  const list = Array.isArray(data) ? data : [data];
  return (
    <>
      {list.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d).replace(/</g, '\\u003c') }} />
      ))}
    </>
  );
}
