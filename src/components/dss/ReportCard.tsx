import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import falconMark from '@/assets/images/falcon-mark.png';
import CardImage from '@/components/dss/CardImage';
import { publicMediaUrl, territoryName, thumbPathOf, weekText, type Report } from '@/lib/data';

/**
 * Tile for the library grid. A study with a cover shows it; otherwise the tile shows the study's
 * Executive Visual, and where there is no visual, the falcon mark.
 */
export default function ReportCard({ report }: { report: Report }) {
  const cover = publicMediaUrl(report.cover_path);
  const visual = report.extract_path ? [publicMediaUrl(thumbPathOf(report.extract_path)), publicMediaUrl(report.extract_path)].filter((u): u is string => Boolean(u)) : [];
  const place = territoryName[report.territory] ?? report.territory;
  const when = weekText(report.week_label) ?? (report.year ? String(report.year) : null);
  return (
    <Link href={`/research/studies/${report.slug}`} className="group tile overflow-hidden flex flex-col hover:border-brand-gold/60 transition-colors">
      {cover ? (
        <div className="aspect-[3/4] bg-brand-navy-dark relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt={report.title} loading="lazy" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="aspect-[4/3] bg-brand-navy-dark relative overflow-hidden border-b border-brand-gold/20">
          <Image src={falconMark} alt="" aria-hidden="true" className="absolute inset-0 m-auto h-[58%] w-auto opacity-40" />
          {visual.length > 0 && <CardImage sources={visual} alt={`${report.title}: Executive Visual`} className="absolute inset-0 w-full h-full object-cover object-top" />}
        </div>
      )}
      <div className="p-5 flex-1 flex flex-col">
        <p className="label-tech mb-2">{place}{when ? ` · ${when}` : ''}</p>
        <p className="text-white font-bold leading-snug">{report.title}</p>
        {report.subtitle && <p className="text-white/55 text-sm mt-1 line-clamp-2">{report.subtitle}</p>}
        <span className="inline-flex items-center gap-2 text-xs text-brand-gold-pale mt-auto pt-3">Examine <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></span>
      </div>
    </Link>
  );
}
