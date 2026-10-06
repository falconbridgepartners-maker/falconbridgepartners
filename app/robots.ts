import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://falconbp.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/research/pack/', '/research/files/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
