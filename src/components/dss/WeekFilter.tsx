'use client';
import { useRouter } from 'next/navigation';

type Props = {
  weeks: { value: string; label: string }[];
  current?: string;
  /** The page this filter sits on, and its other filters, so choosing a week keeps them. */
  basePath: string;
  params?: Record<string, string | undefined>;
};

/** Chooses one week, or all of them. Navigates as soon as a week is picked. */
export default function WeekFilter({ weeks, current, basePath, params = {} }: Props) {
  const router = useRouter();
  if (weeks.length === 0) return null;
  const go = (week: string) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) p.set(k, v);
    if (week) p.set('week', week);
    const q = p.toString();
    router.push(`${basePath}${q ? `?${q}` : ''}`);
  };
  return (
    <label className="inline-flex items-center gap-3 text-sm text-white/60">
      <span>Week</span>
      <select
        value={current ?? ''}
        onChange={(e) => go(e.target.value)}
        className={`rounded-full border bg-brand-navy px-4 py-2 text-sm focus:outline-none focus:border-brand-gold ${current ? 'border-brand-gold text-white' : 'border-brand-gold/30 text-white/80'}`}
      >
        <option value="">All weeks</option>
        {weeks.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
      </select>
    </label>
  );
}
