import { NextResponse } from 'next/server';
import { getAllInsights } from '@/lib/insights';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://falconbp.com';
const SITE_NAME = 'FalconBridge Insights';
const SITE_DESCRIPTION = 'Selected notes on decision-making, discretion, and consequence.';

export async function GET() {
  const insights = await getAllInsights();

  const items = insights
    .map((i) => {
      const url = `${SITE_URL}/insights/${i.slug}`;
      const pubDate = i.publishedAt
        ? new Date(i.publishedAt).toUTCString()
        : new Date().toUTCString();
      return `
    <item>
      <title>${escapeXml(i.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(i.summary)}</description>
    </item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}/insights</link>
    <atom:link href="${SITE_URL}/insights/rss.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-gb</language>${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

function escapeXml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
