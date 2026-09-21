import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { publicMediaUrl, territoryName, type Report } from '@/lib/data';

/** Cover tile for the library grid. Falls back to a typeset cover when no image is uploaded. */
export default function ReportCard({ report }: { report: Report }) {
  const cover = publicMediaUrl(report.cover_path);
  return (
    <Link href={`/research/studies/${report.slug}`} className="group tile overflow-hidden flex flex-col hover:border-brand-gold/60 transition-colors">
      <div className="aspect-[3/4] bg-brand-navy-dark relative">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={report.title} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 p-6 flex flex-col justify-between border-b border-brand-gold/20">
            <p className="label-tech">{territoryName[report.territory] ?? report.territory}</p>
            <div>
              <p className="text-white font-bold text-lg leading-snug">{report.title}</p>
              {report.year && <p className="governing text-sm mt-2">{report.year}</p>}
            </div>
          </div>
        )}
      </div>
      <div className="p-5">
        <p className="text-white font-bold leading-snug">{report.title}</p>
        {report.subtitle && <p className="text-white/55 text-sm mt-1 line-clamp-2">{report.subtitle}</p>}
        <span className="inline-flex items-center gap-2 text-xs text-brand-gold-pale mt-3">Examine <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></span>
      </div>
    </Link>
  );
}
