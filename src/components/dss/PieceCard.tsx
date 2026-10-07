import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { territoryName, type Piece } from '@/lib/data';
import { headlineParts, monthYear, pieceSummary } from '@/lib/pieces';

/** Tile for the Professional Curiosity index: territory and month, the headline as issued, and its opening lines. */
export default function PieceCard({ piece }: { piece: Piece }) {
  const place = territoryName[piece.territory] ?? piece.territory;
  const when = monthYear(piece.published_at);
  const { lead, accent } = headlineParts(piece.content);
  const summary = pieceSummary(piece);
  return (
    <Link href={`/research/professional-curiosity/${piece.slug}`} className="group tile p-6 md:p-8 flex flex-col hover:border-brand-gold/60 transition-colors">
      <p className="label-tech mb-3">{place}{when ? ` · ${when}` : ''}</p>
      <h2 className="text-xl md:text-2xl leading-snug">{lead}{accent ? <> <span className="text-brand-gold">{accent}</span></> : null}</h2>
      {summary && <p className="text-white/60 text-sm md:text-[0.95rem] mt-3 line-clamp-3">{summary}</p>}
      <span className="inline-flex items-center gap-2 text-xs text-brand-gold-pale mt-auto pt-5">Read the piece <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></span>
    </Link>
  );
}
