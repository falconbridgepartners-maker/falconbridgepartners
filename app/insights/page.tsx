import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllInsights } from '@/lib/insights';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://falconbp.com';

export const metadata: Metadata = {
  title: 'Insights | FalconBridge Partners',
  description: 'Selected notes on decision-making, discretion, and consequence.',
  alternates: { canonical: `${SITE_URL}/insights` },
  openGraph: {
    title: 'Insights | FalconBridge Partners',
    description: 'Selected notes on decision-making, discretion, and consequence.',
    url: `${SITE_URL}/insights`,
    type: 'website',
  },
};

export default async function InsightsIndexPage() {
  const insights = await getAllInsights();

  return (
    <div className="pt-40 pb-32 container-editorial">
      <div className="max-w-3xl mb-16">
        <p className="label-tech mb-6">Insights</p>
        <h1 className="mb-8">Notes on decisions of consequence.</h1>
        <p className="text-white/50 max-w-xl">
          We publish rarely, and only when we have something worth saying.
        </p>
      </div>

      {insights.length === 0 ? (
        <p className="text-white/40 italic max-w-3xl">Nothing published yet.</p>
      ) : (
        <ul className="divide-y divide-white/5 max-w-3xl">
          {insights.map((insight) => (
            <li key={insight.slug} className="py-10">
              <Link href={`/insights/${insight.slug}`} className="block group">
                <time className="label-tech" dateTime={insight.publishedAt}>
                  {formatDate(insight.publishedAt)}
                </time>
                <h2 className="text-2xl md:text-3xl mt-3 group-hover:text-brand-gold transition-colors">
                  {insight.title}
                </h2>
                {insight.summary && (
                  <p className="text-white/50 mt-3 max-w-2xl">{insight.summary}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatDate(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
