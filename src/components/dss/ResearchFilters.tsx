import Link from 'next/link';
import WeekFilter from '@/components/dss/WeekFilter';
import { TERRITORIES } from '@/lib/data';

type Props = {
  /** The list page these filters sit on. */
  basePath: string;
  territory?: string;
  week?: string;
  /** Weeks present in the current selection, newest first (weekOptions). */
  weeks: { value: string; label: string }[];
  /** Other filters on the page (the library's type), kept when territory or week changes. */
  params?: Record<string, string | undefined>;
  count: number;
  noun: [singular: string, plural: string];
  /** A page's own extra row, between territories and weeks (the library's types). */
  children?: React.ReactNode;
  /** Right-hand link on the territory row (the Weekly Signal RSS feed). */
  aside?: React.ReactNode;
};

export const chip = (active: boolean) => `px-4 py-2 rounded-full text-sm border ${active ? 'border-brand-gold text-white' : 'border-brand-gold/30 text-white/60'}`;

/** Builds a list-page link that keeps every other filter. */
export function filterHref(basePath: string, params: Record<string, string | undefined>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) p.set(k, v);
  const q = p.toString();
  return `${basePath}${q ? `?${q}` : ''}`;
}

/**
 * The one filter block for the three research lists (Weekly Signal, studies, Professional Curiosity): the same
 * territory chips, the same week menu and the same count line, in the same order, so a reader moves between them
 * without relearning. Choosing a territory keeps the week, and the reverse.
 */
export default function ResearchFilters({ basePath, territory, week, weeks, params = {}, count, noun, children, aside }: Props) {
  const href = (t?: string) => filterHref(basePath, { ...params, territory: t, week });
  const filtered = Boolean(territory || week || Object.values(params).some(Boolean));
  return (
    <div className="mb-10">
      <div className="flex flex-wrap gap-2 mb-4">
        <Link href={href()} className={chip(!territory)}>All territories</Link>
        {TERRITORIES.map((x) => <Link key={x.value} href={href(x.value)} className={chip(territory === x.value)}>{x.label}</Link>)}
        {aside && <span className="ml-auto self-center">{aside}</span>}
      </div>
      {children}
      <div className="flex flex-wrap items-center gap-4">
        <WeekFilter weeks={weeks} current={week} basePath={basePath} params={{ ...params, territory }} />
        <p className="text-sm text-white/45">{count} {count === 1 ? noun[0] : noun[1]}{filtered ? ' in this selection' : ''}</p>
      </div>
    </div>
  );
}
