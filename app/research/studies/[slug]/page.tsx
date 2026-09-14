import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Download } from 'lucide-react';
import PageHero from '@/components/dss/PageHero';
import Invitation from '@/components/dss/Invitation';
import { Section, Band } from '@/components/dss/Tiles';
import { featuredStudy } from '@/content/site';

export function generateStaticParams() {
  return [{ slug: featuredStudy.slug }];
}

export const metadata: Metadata = {
  title: `${featuredStudy.title} — FalconBridge Partners`,
  description: featuredStudy.subtitle,
};

export default function StudyPage({ params }: { params: { slug: string } }) {
  if (params.slug !== featuredStudy.slug) notFound();
  const s = featuredStudy;
  return (
    <>
      <PageHero eyebrow={`Public study · ${s.territory}`} title={s.title} governing={s.subtitle} />
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <div className="tile p-8 md:p-10 aspect-[4/3] flex items-center justify-center text-center">
              <div>
                <p className="governing text-2xl mb-3">The FalconBridge 3% Monitor</p>
                <p className="text-white/55 text-sm max-w-md">{s.extractNote}</p>
                <p className="text-[0.68rem] text-brand-gold-pale mt-6">Report extract to be placed here — prototype</p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 space-y-4">
            {s.facts.map((f) => (
              <div key={f.figure} className="tile-ivory p-6">
                <p className="governing text-2xl mb-1" style={{ color: '#262626' }}>{f.figure}</p>
                <p className="text-sm">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>
      <Section eyebrow="The complete package" title="Six elements, tailored to the question and to how readers will use the work">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {s.package.map((p) => (
            <div key={p} className="tile p-5 flex items-center justify-between gap-3">
              <span className="text-white text-sm font-bold">{p}</span>
              <span className="inline-flex items-center gap-1.5 text-[0.7rem] text-white/40"><Download className="w-3.5 h-3.5" /> download</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-white/45 mt-4">Downloads are placeholders in the prototype. Public access does not transfer ownership or automatically permit republication.</p>
        <div className="mt-10"><Band title="The sample demonstrates the work" body={s.qualifier} /></div>
      </Section>
      <Invitation compact />
    </>
  );
}
