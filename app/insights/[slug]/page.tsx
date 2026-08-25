import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getAllInsights, getInsightBySlug } from '@/lib/insights';
import { mdxComponents } from '@/components/mdx-components';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://falconbp.com';

export async function generateStaticParams() {
  const insights = await getAllInsights({ includeDrafts: true });
  return insights.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata(
  { params }: { params: { slug: string } },
): Promise<Metadata> {
  const insight = await getInsightBySlug(params.slug);
  if (!insight) return {};

  const url = `${SITE_URL}/insights/${insight.slug}`;
  const image = insight.ogImage ? `${SITE_URL}${insight.ogImage}` : undefined;

  return {
    title: `${insight.title} | FalconBridge Insights`,
    description: insight.summary,
    robots: insight.draft ? { index: false, follow: false } : undefined,
    alternates: { canonical: url },
    openGraph: {
      title: insight.title,
      description: insight.summary,
      url,
      type: 'article',
      publishedTime: insight.publishedAt || undefined,
      images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: insight.title,
      description: insight.summary,
      images: image ? [image] : undefined,
    },
  };
}

export default async function InsightPage({ params }: { params: { slug: string } }) {
  const insight = await getInsightBySlug(params.slug);
  if (!insight) notFound();

  return (
    <article className="pt-40 pb-32 container-editorial">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/insights"
          className="label-tech hover:text-brand-gold transition-colors"
        >
          ← Insights
        </Link>

        <header className="mt-8 mb-12">
          <time className="label-tech block mb-6" dateTime={insight.publishedAt}>
            {formatDate(insight.publishedAt)}
          </time>
          <h1 className="mb-6">{insight.title}</h1>
          {insight.summary && (
            <p className="text-xl text-white/60 font-light leading-relaxed">
              {insight.summary}
            </p>
          )}
          {insight.draft && (
            <p className="mt-6 inline-block text-[0.65rem] font-technical uppercase tracking-[0.3em] text-brand-gold border border-brand-gold/30 rounded-full px-3 py-1">
              Draft — not indexed
            </p>
          )}
        </header>

        <div className="prose prose-invert prose-lg max-w-none prose-headings:font-technical prose-headings:text-white prose-p:text-brand-grey prose-a:text-brand-gold hover:prose-a:text-brand-gold/80 prose-strong:text-white prose-blockquote:text-white/70 prose-blockquote:border-brand-gold/40">
          <MDXRemote source={insight.body} components={mdxComponents} />
        </div>
      </div>
    </article>
  );
}

function formatDate(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}
