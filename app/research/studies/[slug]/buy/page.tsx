import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import PageHero from '@/components/dss/PageHero';
import { Section } from '@/components/dss/Tiles';
import BuyLicence from '@/components/dss/BuyLicence';
import { getReportBySlug, isPlaceholder } from '@/lib/data';
import { AED_PRICES, COUNTRIES, isCountry, tierFor, usdFromAed, usdRates } from '@/lib/licencePricing';
import { summaryRows } from '@/content/researchLicences';
import { stripeConfigured, stripeTestMode } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const s = await getReportBySlug(params.slug);
  if (!s) return {};
  return { title: `Buy a business licence: ${s.title} — FalconBridge Partners`, robots: { index: false, follow: true }, alternates: { canonical: `/research/studies/${s.slug}/buy` } };
}

const fmt = (n: number) => n.toLocaleString('en-US');

export default async function BuyPage({ params }: { params: { slug: string } }) {
  const s = await getReportBySlug(params.slug);
  if (!s || isPlaceholder(s) || s.kind !== 'study') notFound();
  const tier = tierFor(s.published_at);
  // Vercel tells us where the visitor is; it pre-selects the country and sets the local-currency estimate.
  const ip = headers().get('x-vercel-ip-country');
  const defaultCountry = isCountry(ip) ? ip : 'AE';
  const rates = await usdRates();
  const published = s.published_at ? new Date(s.published_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }) : null;
  const tierLine = tier === 'back'
    ? `Published ${published ?? 'more than three months ago'}, so back-catalogue prices apply. New reports: Type 2 US$${fmt(usdFromAed(AED_PRICES.new.t2))} and Type 3 US$${fmt(usdFromAed(AED_PRICES.new.t3))}.`
    : `Published ${published ?? 'recently'}: new-report prices apply for three months from publication.`;
  // The summary column for each licence, from section 5 of the Research Licences.
  const summary = {
    t2: summaryRows.filter((r) => !r.g).map((r) => ({ k: r.a ?? '', v: r.c ?? '' })),
    t3: summaryRows.filter((r) => !r.g).map((r) => ({ k: r.a ?? '', v: r.d ?? '' })),
  };
  return (
    <>
      <PageHero eyebrow="Buy a business licence" title={s.title} governing={`${tierLine} All prices in US$, excluding VAT.`} />
      <Section>
        <BuyLicence
          slug={s.slug}
          title={s.title}
          tier={tier}
          countries={COUNTRIES.map(({ code, name, high, currency }) => ({ code, name, high, currency, rate: currency ? rates[currency] ?? null : null }))}
          defaultCountry={defaultCountry}
          detected={isCountry(ip)}
          summary={summary}
          card={stripeConfigured()}
          testMode={stripeConfigured() && stripeTestMode()}
        />
      </Section>
    </>
  );
}
