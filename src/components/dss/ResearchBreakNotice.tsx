import { researchBreakActive } from '@/lib/data';

/** Year-end research break notice. Shows itself after the last run of the year and removes itself on the return date. */
export default function ResearchBreakNotice() {
  if (!researchBreakActive()) return null;
  return (
    <aside aria-label="Year-end research break" className="mt-8 max-w-3xl rounded-lg border border-brand-gold/40 bg-white/5 p-5 md:p-6">
      <p className="label-tech mb-2">Year-end research break</p>
      <p className="text-white/85 text-base md:text-lg">
        Our research team has closed for the year. Week 48 was our last run of 2026. This covers the Weekly Signal, our studies and Professional Curiosity. Our first research of 2027 will be out in Week 2, on Monday 11 January 2027.
      </p>
      <p className="text-white/85 text-base md:text-lg mt-3">
        Client research requests received during the break will be handled from Monday 11 January 2027.
      </p>
      <p className="text-white/60 text-sm mt-3">Everything already published stays open to read and download.</p>
    </aside>
  );
}
