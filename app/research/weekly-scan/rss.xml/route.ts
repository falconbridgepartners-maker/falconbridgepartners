import { getAllScans, territoryName } from '@/lib/content';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://falconbp.com';
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function GET() {
  const scans = await getAllScans();
  const items = scans.map((s) => `
    <item>
      <title>${esc(`${territoryName[s.territory] ?? s.territory}: ${s.question}`)}</title>
      <link>${SITE_URL}/research/weekly-scan/${s.slug}</link>
      <guid>${SITE_URL}/research/weekly-scan/${s.slug}</guid>
      <pubDate>${s.weekOf ? new Date(s.weekOf).toUTCString() : ''}</pubDate>
      <description>${esc(s.signal)}</description>
    </item>`).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>FalconBridge Partners — Weekly Scan</title>
  <link>${SITE_URL}/research/weekly-scan</link>
  <description>Territorial signals turned into decision-relevant questions.</description>${items}
</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
