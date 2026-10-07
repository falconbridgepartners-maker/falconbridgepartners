import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getPieceBySlug, getReportBySlug, getScanBySlug, territoryName, weekText } from '@/lib/data';
import { clip, headlineParts, pieceByline, PIECE_SERIES } from '@/lib/pieces';
import { SHARE_IMAGE } from '@/lib/share';

/**
 * The link-preview image for a page that has none of its own: the headline, drawn in the site's style
 * (charcoal, gold hairline, the FalconBridge mark). 1200 × 630, the size LinkedIn and X show in full.
 *
 *   /og/piece/<slug>   a Professional Curiosity piece
 *   /og/study/<slug>   a study in the Research Library
 *   /og/signal/<slug>  a Weekly Signal
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CHARCOAL = '#262626', CHARCOAL_DARK = '#1c1c1c', GOLD = '#c8a86a', GOLD_PALE = '#e3ce98', GREY = '#b8bdc8';

// Fonts and logo live in assets/og (see the README there). Arimo and Gelasio are the open, metric-compatible
// counterparts of the site's Arial and Georgia, which cannot be embedded.
const asset = (name: string) => readFile(join(process.cwd(), 'assets', 'og', name));
let assets: Promise<{ regular: Buffer; bold: Buffer; italic: Buffer; logo: string }> | null = null;
const loadAssets = () => (assets ??= Promise.all([
  asset('arimo-latin-400-normal.woff'), asset('arimo-latin-700-normal.woff'), asset('gelasio-latin-400-italic.woff'), asset('logo.png'),
]).then(([regular, bold, italic, logo]) => ({ regular, bold, italic, logo: `data:image/png;base64,${logo.toString('base64')}` })));

type Card = { eyebrow: string; lead: string; accent?: string | null; sub?: string | null; foot?: string | null };

const KIND_LABEL: Record<string, string> = { study: 'Public study', sample: 'Commissioned sample', paper: 'White paper' };

async function cardFor(kind: string, slug: string): Promise<Card | null> {
  if (kind === 'piece') {
    const p = await getPieceBySlug(slug);
    if (!p) return null;
    const { lead, accent } = headlineParts(p.content);
    return { eyebrow: p.content.series?.trim() || p.series || PIECE_SERIES, lead, accent, foot: pieceByline(p) };
  }
  if (kind === 'study') {
    const s = await getReportBySlug(slug);
    if (!s) return null;
    return {
      eyebrow: [KIND_LABEL[s.kind] ?? 'Study', territoryName[s.territory] ?? s.territory, s.year ? String(s.year) : null].filter(Boolean).join(' · '),
      lead: s.title, sub: s.subtitle ? clip(s.subtitle, 150) : null, foot: 'Research Library',
    };
  }
  if (kind === 'signal') {
    const e = await getScanBySlug(slug);
    if (!e) return null;
    const place = territoryName[e.territory] ?? e.territory;
    const week = weekText(e.week_label) ?? `Week of ${e.week_of}`;
    if (e.content) return { eyebrow: ['Weekly Signal', place, week].join(' · '), lead: e.content.heading, sub: clip(e.content.lead?.title ?? e.question, 150), foot: e.content.review_period ? `Review period: ${e.content.review_period}` : 'Weekly Scan' };
    return { eyebrow: ['Weekly Scan', place, week].join(' · '), lead: clip(e.question, 150), foot: 'Weekly Scan' };
  }
  return null;
}

/** A headline size that keeps the longest headlines inside the card. */
const sizeFor = (chars: number, hasSub: boolean) => {
  const base = chars <= 36 ? 86 : chars <= 60 ? 74 : chars <= 90 ? 62 : chars <= 120 ? 54 : chars <= 160 ? 46 : 40;
  return hasSub ? Math.min(base, 66) : base;
};

/** Words as separate items so the headline wraps naturally while its closing words are set in gold. */
const words = (text: string, color: string, key: string) => text.split(/\s+/).filter(Boolean).map((w, i) => (
  <span key={`${key}${i}`} style={{ color, marginRight: '0.26em' }}>{w}</span>
));

export async function GET(_req: Request, { params }: { params: { kind: string; slug: string } }) {
  const card = await cardFor(params.kind, params.slug);
  if (!card) return new Response('Not found', { status: 404 });
  const { regular, bold, italic, logo } = await loadAssets();
  const chars = card.lead.length + (card.accent ? card.accent.length + 1 : 0);
  const size = sizeFor(chars, Boolean(card.sub));
  const foot = card.foot ?? 'FalconBridge Partners';

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', backgroundColor: CHARCOAL, backgroundImage: `linear-gradient(180deg, ${CHARCOAL_DARK} 0%, ${CHARCOAL} 62%)`, padding: 28, fontFamily: 'Arimo' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid rgba(200,168,106,0.38)', borderRadius: 22, padding: '40px 52px 34px 52px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img src={logo} width={198} height={66} />
            <div style={{ display: 'flex', color: GOLD, fontSize: 19, fontWeight: 700, letterSpacing: 3.6, textTransform: 'uppercase', textAlign: 'right', maxWidth: 720 }}>{card.eyebrow}</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', fontSize: size, fontWeight: 700, lineHeight: 1.12, letterSpacing: -0.6, color: '#ffffff' }}>
              {words(card.lead, '#ffffff', 'l')}
              {card.accent ? words(card.accent, GOLD, 'a') : null}
            </div>
            {card.sub ? <div style={{ display: 'flex', marginTop: 22, fontFamily: 'Gelasio', fontStyle: 'italic', fontSize: 30, lineHeight: 1.3, color: GOLD_PALE }}>{card.sub}</div> : null}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(200,168,106,0.3)', paddingTop: 20, fontSize: 21 }}>
            <div style={{ display: 'flex', color: GREY, maxWidth: 880, fontSize: foot.length > 70 ? 18 : 21 }}>{foot}</div>
            <div style={{ display: 'flex', color: GOLD_PALE, fontWeight: 700 }}>falconbp.com</div>
          </div>
        </div>
      </div>
    ),
    {
      ...SHARE_IMAGE,
      fonts: [
        { name: 'Arimo', data: regular, weight: 400, style: 'normal' },
        { name: 'Arimo', data: bold, weight: 700, style: 'normal' },
        { name: 'Gelasio', data: italic, weight: 400, style: 'italic' },
      ],
      // The address stays the same when a headline is corrected, so the image is cached for an hour, not for good.
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400' },
    },
  );
}
