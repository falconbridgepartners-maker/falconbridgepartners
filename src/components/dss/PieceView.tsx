import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import PageHero from '@/components/dss/PageHero';
import PieceBody from '@/components/dss/PieceBody';
import { Section } from '@/components/dss/Tiles';
import type { Piece, Report } from '@/lib/data';
import { headlineParts, pieceByline, PIECE_SERIES } from '@/lib/pieces';

type Study = (Pick<Report, 'slug' | 'title' | 'subtitle'> & { canRequest: boolean }) | null;

/**
 * A Professional Curiosity piece as the reader sees it: the series label, the headline, the byline, the body
 * as issued, the study behind it and the closing disclaimer. Used by the public page and the admin preview.
 */
export default function PieceView({ piece, study }: { piece: Piece; study: Study }) {
  const c = piece.content;
  const { lead, accent } = headlineParts(c);
  return (
    <>
      <PageHero eyebrow={c.series?.trim() || piece.series || PIECE_SERIES} title={lead} titleAccent={accent ?? undefined}>
        <p className="text-sm md:text-base text-white/60">{pieceByline(piece)}</p>
      </PageHero>
      <Section className="!pt-4 md:!pt-6">
        <PieceBody content={c} />
        {study && (
          <div className="tile p-7 md:p-9 border-brand-gold/40 mt-14">
            <p className="label-tech mb-3">The study behind this piece</p>
            <h2 className="text-2xl md:text-3xl mb-2">{study.title}</h2>
            {study.subtitle && <p className="text-white/70 max-w-3xl">{study.subtitle}</p>}
            <div className="flex flex-wrap items-center gap-x-7 gap-y-4 mt-7">
              {study.canRequest && <Button href={`/research/studies/${study.slug}#research-pack`} variant="primary" size="sm" icon={ArrowRight}>Request the full study</Button>}
              <Link href={`/research/studies/${study.slug}`} className="inline-flex items-center gap-2 text-brand-gold-pale text-sm">Examine the study <ArrowRight className="w-4 h-4" /></Link>
            </div>
            {c.request_note && <p className="text-sm text-white/50 mt-5">{c.request_note}</p>}
          </div>
        )}
        {c.disclaimer && <p className="text-sm text-white/45 whitespace-pre-line max-w-4xl border-t border-brand-gold/15 pt-6 mt-12">{c.disclaimer}</p>}
        <p className="text-sm text-white/45 mt-8"><Link href="/research/professional-curiosity" className="text-brand-gold-pale underline underline-offset-4">All Professional Curiosity pieces</Link></p>
      </Section>
    </>
  );
}
