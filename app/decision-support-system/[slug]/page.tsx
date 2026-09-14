import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PageHero from '@/components/dss/PageHero';
import Invitation from '@/components/dss/Invitation';
import { Section, Tile, ThreeColumns, Band, NextLink } from '@/components/dss/Tiles';
import { services, serviceByKey, situations } from '@/content/site';

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const s = services.find((x) => x.slug === params.slug);
  if (!s) return {};
  return {
    title: `${s.acronym} · ${s.name} — FalconBridge Partners`,
    description: s.governingQuestion,
  };
}

export default function ServicePage({ params }: { params: { slug: string } }) {
  const s = services.find((x) => x.slug === params.slug);
  if (!s) notFound();
  const isRaaS = s.key === 'raas';
  const relatedSituations = situations.filter((sit) => sit.services.includes(s.key));

  return (
    <>
      <PageHero eyebrow={`${s.grouping} · ${s.acronym}`} title={s.name} governing={s.governingQuestion} intro={s.intro} />

      <Section>
        <ThreeColumns items={s.columns} />
        <div className="mt-10">
          <Band title={s.boundaryTitle} body={s.boundary} />
        </div>
      </Section>

      <Section eyebrow={isRaaS ? 'A complete bespoke research package' : 'The work'} title={isRaaS ? s.outputs.title : undefined} intro={isRaaS ? s.outputs.body : undefined}>
        <div className={`grid grid-cols-1 gap-4 ${isRaaS ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
          {s.work.map((w, i) => (
            <div key={w.title} className={isRaaS ? 'tile-ivory p-6' : 'tile p-6 flex gap-5'}>
              {!isRaaS && <span className="governing text-xl shrink-0 w-8">{String(i + 1).padStart(2, '0')}</span>}
              <div>
                <h3 className="text-base md:text-lg mb-1.5">{w.title}</h3>
                <p className="text-sm md:text-[0.95rem]">{w.body}</p>
              </div>
            </div>
          ))}
        </div>
        {isRaaS && (
          <p className="text-white/55 text-sm mt-6">The Global Discovery Research System (GDRS) powers RaaS. Findings are bounded by the agreed question, available evidence and date.</p>
        )}
      </Section>

      {s.notes && (
        <Section eyebrow={s.notes.heading}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {s.notes.items.map((n) => <Tile key={n.title} ivory title={n.title} body={n.body} />)}
          </div>
          {s.notes.closing && <p className="governing text-xl md:text-2xl mt-8 max-w-4xl">{s.notes.closing}</p>}
        </Section>
      )}

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {!isRaaS && <Tile title={s.outputs.title} body={s.outputs.body} />}
          <Tile title={s.yourInvolvement.title} body={s.yourInvolvement.body} />
          <Tile title={s.limits.title} body={s.limits.body} />
        </div>
        <div className="mt-10">
          <Band title={s.closing.title} body={s.closing.body} />
        </div>
      </Section>

      <Section eyebrow="Adjacent">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {s.related.map((k) => {
            const r = serviceByKey(k);
            return <NextLink key={k} href={`/decision-support-system/${r.slug}`} label={`${r.acronym} · ${r.name}`} sub={r.summary} />;
          })}
          {relatedSituations.map((sit) => (
            <NextLink key={sit.slug} href={`/situations/${sit.slug}`} label={sit.title} sub={sit.audience} />
          ))}
        </div>
        <p className="text-sm text-white/45 mt-6">
          <Link href="/decision-support-system" className="text-brand-gold-pale underline underline-offset-4">All five services</Link> · <Link href="/working-with-falconbridge" className="text-brand-gold-pale underline underline-offset-4">Working with FalconBridge</Link>
        </p>
      </Section>

      <Invitation compact />
    </>
  );
}
