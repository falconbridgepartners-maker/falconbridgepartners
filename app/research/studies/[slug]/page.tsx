import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Download } from 'lucide-react';
import PageHero from '@/components/dss/PageHero';
import Invitation from '@/components/dss/Invitation';
import RequestReport from '@/components/dss/RequestReport';
import { Section, Band } from '@/components/dss/Tiles';
import { getAllStudies, getStudyBySlug, territoryName } from '@/lib/content';

export async function generateStaticParams() {
  const all = await getAllStudies({ includeDrafts: true });
  return all.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const s = await getStudyBySlug(params.slug);
  if (!s) return {};
  return { title: `${s.title} — FalconBridge Partners`, description: s.subtitle };
}

export default async function StudyPage({ params }: { params: { slug: string } }) {
  const s = await getStudyBySlug(params.slug);
  if (!s || s.draft) notFound();
  const hasFiles = s.files.some((f) => f.url);
  return (
    <>
      <PageHero eyebrow={`Public study · ${territoryName[s.territory] ?? s.territory}`} title={s.title} governing={s.subtitle} />
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <div className="tile p-8 md:p-10 aspect-[4/3] flex items-center justify-center text-center overflow-hidden">
              {s.extractImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.extractImage} alt={`${s.title} — extract`} className="w-full h-full object-contain" />
              ) : (
                <div>
                  <p className="governing text-2xl mb-3">Report extract</p>
                  <p className="text-white/55 text-sm max-w-md">{s.extractNote}</p>
                  <p className="text-[0.68rem] text-brand-gold-pale mt-6">Extract image to be placed here — prototype</p>
                </div>
              )}
            </div>
            {s.body.trim() && <p className="text-white/70 mt-6">{s.body.trim()}</p>}
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {s.files.map((f) => (
            f.url ? (
              <a key={f.label} href={f.url} className="tile p-5 flex items-center justify-between gap-3 hover:border-brand-gold/60 transition-colors">
                <span className="text-white text-sm font-bold">{f.label}</span>
                <Download className="w-4 h-4 text-brand-gold" />
              </a>
            ) : (
              <div key={f.label} className="tile p-5 flex items-center justify-between gap-3">
                <span className="text-white text-sm font-bold">{f.label}</span>
                <span className="text-[0.7rem] text-white/40">on request</span>
              </div>
            )
          ))}
        </div>
        <RequestReport studyTitle={s.title} />
        {!hasFiles && <p className="text-sm text-white/45 mt-4">Direct downloads are added as each element is released.</p>}
        <div className="mt-10"><Band title="The sample demonstrates the work" body={s.qualifier} /></div>
      </Section>
      <Invitation compact />
    </>
  );
}
