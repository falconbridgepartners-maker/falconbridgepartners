import Link from 'next/link';
import { NextLink } from '@/components/dss/Tiles';
import { weekText, type Piece, type Report, type Scan } from '@/lib/data';
import { scanTitle, territoryLabel, territoryPath } from '@/lib/related';

/**
 * The sideways links at the foot of a research page: neighbouring signals, the same week elsewhere, other studies
 * and pieces, and the territory they all belong to. Each block appears only when it has something to show.
 */

export const SignalLinks = ({ earlier, later, sameWeek }: { earlier: Scan | null; later: Scan | null; sameWeek: Scan[] }) => (
  <>
    {(earlier || later) && (
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
        {earlier && <NextLink href={`/research/weekly-scan/${earlier.slug}`} label={`The week before: ${scanTitle(earlier)}`} sub={`${territoryLabel(earlier.territory)} · ${weekText(earlier.week_label) ?? `week of ${earlier.week_of}`}`} />}
        {later && <NextLink href={`/research/weekly-scan/${later.slug}`} label={`The week after: ${scanTitle(later)}`} sub={`${territoryLabel(later.territory)} · ${weekText(later.week_label) ?? `week of ${later.week_of}`}`} />}
      </div>
    )}
    {sameWeek.length > 0 && (
      <div className="mt-8">
        <p className="label-tech mb-3">The same week in the other territories</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sameWeek.map((s) => <NextLink key={s.id} href={`/research/weekly-scan/${s.slug}`} label={scanTitle(s)} sub={territoryLabel(s.territory)} />)}
        </div>
      </div>
    )}
  </>
);

export const StudyLinks = ({ studies, heading }: { studies: Report[]; heading: string }) => studies.length === 0 ? null : (
  <div className="mt-8">
    <p className="label-tech mb-3">{heading}</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {studies.map((r) => <NextLink key={r.id} href={`/research/studies/${r.slug}`} label={r.title} sub={r.subtitle ?? `${territoryLabel(r.territory)}${r.week_label ? ` · ${weekText(r.week_label)}` : ''}`} />)}
    </div>
  </div>
);

export const PieceLinks = ({ pieces, heading }: { pieces: Piece[]; heading: string }) => pieces.length === 0 ? null : (
  <div className="mt-8">
    {heading && <p className="label-tech mb-3">{heading}</p>}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {pieces.map((p) => <NextLink key={p.id} href={`/research/professional-curiosity/${p.slug}`} label={p.content.headline} sub={territoryLabel(p.territory)} />)}
    </div>
  </div>
);

/** The line at the foot: the territory this belongs to and the index it sits in. */
export const TerritoryLine = ({ territory, index }: { territory: string; index: { href: string; label: string } }) => (
  <p className="text-sm text-white/45 mt-8">
    <Link href={territoryPath(territory)} className="text-brand-gold-pale underline underline-offset-4">All research on {territoryLabel(territory)}</Link>
    {' · '}
    <Link href={index.href} className="text-brand-gold-pale underline underline-offset-4">{index.label}</Link>
  </p>
);
