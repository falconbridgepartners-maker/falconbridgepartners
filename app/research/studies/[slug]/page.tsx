import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowDown, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import PageHero from '@/components/dss/PageHero';
import { acronymize } from '@/components/dss/acronymize';
import Invitation from '@/components/dss/Invitation';
import RequestReport from '@/components/dss/RequestReport';
import { Section, Band, NextLink } from '@/components/dss/Tiles';
import { clip } from '@/lib/pieces';
import { generatedImagePath, shareMetadata } from '@/lib/share';
import { getPiecesForStudy, getReportBySlug, getScanForStudy, hasGatedPack, hasRequestForm, publicMediaUrl, readerFiles, territoryName, weekText } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const s = await getReportBySlug(params.slug);
  if (!s) return {};
  const cover = publicMediaUrl(s.cover_path);
  // The link preview carries this study's own title, description and image on LinkedIn and on X alike.
  return shareMetadata({
    pageTitle: `${s.title} — FalconBridge Partners`,
    title: s.title,
    description: s.subtitle ?? (s.body ? clip(s.body) : null),
    path: `/research/studies/${s.slug}`,
    image: cover ? { url: cover, generated: false } : { url: generatedImagePath('study', s.slug), generated: true },
    publishedTime: s.published_at,
  });
}

const COUNT = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];

export default async function StudyPage({ params }: { params: { slug: string } }) {
  const s = await getReportBySlug(params.slug);
  if (!s) notFound();
  const extract = publicMediaUrl(s.extract_path);
  const all = s.files ?? [];
  // With uploaded pack files behind the form, the pack is emailed automatically and only real files are listed.
  // Otherwise (older studies) every non-internal element is listed and a partner replies to the request by hand.
  const auto = hasGatedPack(all);
  const files = auto ? readerFiles(all) : all.filter((f) => f.access !== 'internal');
  const isOpen = (f: (typeof files)[number]) => Boolean(f.storage_path) && f.access === 'open';
  const hasOpen = files.some(isOpen);
  const hasRequest = hasRequestForm(all);
  const [scan, pieces] = await Promise.all([getScanForStudy(s.id), getPiecesForStudy(s.id)]);
  return (
    <>
      <PageHero eyebrow={`${s.kind === 'study' ? 'Public study' : s.kind === 'sample' ? 'Commissioned sample' : 'White paper'} · ${territoryName[s.territory] ?? s.territory}${s.year ? ` · ${s.year}` : ''}`} title={s.title} governing={s.subtitle ?? undefined}>
        {hasRequest && (
          <div className="mt-2">
            <Button href="#research-pack" variant="primary" size="sm" icon={ArrowDown}>{auto ? 'Get the research pack' : 'Request the full report'}</Button>
          </div>
        )}
      </PageHero>
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            {extract ? (
              <figure>
                <a href={extract} target="_blank" rel="noopener" className="tile block p-3 md:p-4 overflow-hidden hover:border-brand-gold/60 transition-colors" aria-label={`${s.title} — open the extract at full size`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={extract} alt={`${s.title} — extract`} className="w-full h-auto rounded-md" />
                </a>
                {s.extract_note && <figcaption className="text-white/50 text-sm mt-3">{s.extract_note}</figcaption>}
              </figure>
            ) : s.extract_note ? (
              <div className="tile p-8 md:p-10 aspect-[4/3] flex items-center justify-center text-center overflow-hidden">
                <div>
                  <p className="governing text-2xl mb-3">Report extract</p>
                  <p className="text-white/55 text-sm max-w-md">{s.extract_note}</p>
                </div>
              </div>
            ) : null}
            {s.body && <p className={`text-white/70 whitespace-pre-line ${extract || s.extract_note ? 'mt-6' : ''}`}>{acronymize(s.body)}</p>}
          </div>
          <div className="lg:col-span-5 space-y-4">
            {s.facts.map((f) => (
              <div key={f.figure} className="tile-ivory p-6">
                <p className="governing text-2xl mb-1" style={{ color: '#262626' }}>{f.figure}</p>
                <p className="text-sm">{acronymize(f.body)}</p>
              </div>
            ))}
            {scan && <NextLink href={`/research/weekly-scan/${scan.slug}`} label="The Weekly Signal behind this study" sub={[territoryName[scan.territory] ?? scan.territory, weekText(scan.week_label) ?? `week of ${scan.week_of}`].join(' · ')} />}
            {pieces.map((piece) => <NextLink key={piece.slug} href={`/research/professional-curiosity/${piece.slug}`} label="The Professional Curiosity piece on this study" sub={piece.title} />)}
          </div>
        </div>
      </Section>
      <Section eyebrow="The complete package" title={`${COUNT[files.length] ?? files.length} element${files.length === 1 ? '' : 's'}, tailored to the question and to how readers will use the work`}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {files.map((f) => (
            isOpen(f) ? (
              <a key={f.id} href={`/research/files/${f.id}`} className="tile p-5 flex items-center justify-between gap-3 hover:border-brand-gold/60 transition-colors">
                <span className="text-white text-sm font-bold">{f.label}</span>
                <Download className="w-4 h-4 text-brand-gold" />
              </a>
            ) : (
              <div key={f.id} className="tile p-5 flex items-center justify-between gap-3">
                <span className="text-white text-sm font-bold">{f.label}</span>
                <span className="text-[0.7rem] text-white/40">{auto ? 'in the pack' : 'on request'}</span>
              </div>
            )
          ))}
        </div>
        {hasRequest && <div id="research-pack" className="scroll-mt-32"><RequestReport studyTitle={s.title} slug={s.slug} auto={auto} packFiles={auto ? files.map((f) => f.label) : []} /></div>}
        {!auto && !hasOpen && hasRequest && <p className="text-sm text-white/45 mt-4">Direct downloads are added as each element is released.</p>}
        {s.qualifier && <div className="mt-10"><Band title="The sample demonstrates the work" body={s.qualifier} /></div>}
      </Section>
      <Invitation compact />
    </>
  );
}
