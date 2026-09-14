import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageHero from '@/components/dss/PageHero';
import Invitation from '@/components/dss/Invitation';
import { Section, ThreeColumns, Band, NextLink } from '@/components/dss/Tiles';
import { situations, serviceByKey } from '@/content/site';

export function generateStaticParams() {
  return situations.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const s = situations.find((x) => x.slug === params.slug);
  if (!s) return {};
  return { title: `${s.title} — FalconBridge Partners`, description: s.audience };
}

export default function SituationPage({ params }: { params: { slug: string } }) {
  const s = situations.find((x) => x.slug === params.slug);
  if (!s) notFound();
  const others = situations.filter((x) => x.slug !== s.slug);
  return (
    <>
      <PageHero eyebrow="Who we serve" title={s.title} governing={s.opening} intro={s.audience} />
      <Section>
        <ThreeColumns items={s.columns} />
        <div className="mt-10"><Band title={s.noteTitle} body={s.note} /></div>
      </Section>
      <Section eyebrow="Services that serve this situation">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {s.services.map((k) => {
            const sv = serviceByKey(k);
            return <NextLink key={k} href={`/decision-support-system/${sv.slug}`} label={`${sv.acronym} · ${sv.name}`} sub={sv.governingQuestion} />;
          })}
        </div>
      </Section>
      <Section eyebrow="Other situations">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {others.map((o) => <NextLink key={o.slug} href={`/situations/${o.slug}`} label={o.short} sub={o.opening} />)}
        </div>
      </Section>
      <Invitation compact />
    </>
  );
}
