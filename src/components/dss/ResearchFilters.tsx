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

/** The three research lists, in the order the research page shows them. */
const LISTS = [
  { label: 'Weekly Scan', href: '/research/weekly-scan' },
  { label: 'Research Library', href: '/research/library' },
  { label: 'Professional Curiosity', href: '/research/professional-curiosity' },
] as const;

/**
 * Moves a reader between the three research lists without going back to the research page. The territory in
 * view is carried across; the week and the library's type are not, since the other list may have nothing for them.
 */
export function ResearchSwitcher({ basePath, territory }: { basePath: string; territory?: string }) {
  return (
    <nav aria-label="Research sections" className="flex flex-wrap items-end gap-x-8 gap-y-2 mb-8 border-b border-brand-gold/20">
      {LISTS.map((x) => {
        const current = x.href === basePath;
        return (
          <Link key={x.href} href={filterHref(x.href, { territory })} aria-current={current ? 'page' : undefined}
            className={`-mb-px pb-3 text-sm tracking-wide border-b-2 transition-colors ${current ? 'border-brand-gold text-white font-semibold' : 'border-transparent text-white/55 hover:text-white'}`}>
            {x.label}
          </Link>
        );
      })}
    </nav>
  );
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
      <ResearchSwitcher basePath={basePath} territory={territory} />
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
