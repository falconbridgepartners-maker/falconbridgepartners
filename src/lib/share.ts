import type { Metadata } from 'next';

/**
 * Link previews. A page that is shared (a piece, a study, a Weekly Signal) states its own title, description
 * and image for Open Graph and for X, so a posted link never falls back to the site-wide defaults.
 */

export const SITE_NAME = 'FalconBridge Partners';
export const SHARE_IMAGE = { width: 1200, height: 630 } as const;

export type ShareKind = 'piece' | 'study' | 'signal';
/** The image drawn from the page's headline in the site's style (see app/og/[kind]/[slug]/route.tsx). */
export const generatedImagePath = (kind: ShareKind, slug: string) => `/og/${kind}/${slug}`;

type ShareInput = {
  pageTitle: string;            // the browser title, with the firm's name
  title: string;                // the title shown in the preview, without it
  description?: string | null;
  path: string;                 // the page's own address, from the site root
  /** A per-page image when the page has one; otherwise the generated image. */
  image: { url: string; generated: boolean };
  publishedTime?: string | null;
};

export function shareMetadata(s: ShareInput): Metadata {
  const description = s.description?.replace(/\s+/g, ' ').trim() || undefined;
  const image = { url: s.image.url, alt: s.title, ...(s.image.generated ? { ...SHARE_IMAGE, type: 'image/png' } : {}) };
  return {
    title: s.pageTitle,
    description,
    openGraph: {
      type: 'article', siteName: SITE_NAME, title: s.title, description, url: s.path, images: [image],
      ...(s.publishedTime ? { publishedTime: s.publishedTime } : {}),
    },
    twitter: { card: 'summary_large_image', title: s.title, description, images: [image] },
  };
}
