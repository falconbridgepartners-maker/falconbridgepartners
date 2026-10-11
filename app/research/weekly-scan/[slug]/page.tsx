import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import PageHero from '@/components/dss/PageHero';
import Invitation from '@/components/dss/Invitation';
import SignalAsIssued from '@/components/dss/SignalAsIssued';
import { Section, Tile, Band, NextLink } from '@/components/dss/Tiles';
import { getPiecesForStudy, getPublishedScans, getScanBySlug, getStudyForScan, territoryName, weekText } from '@/lib/data';
import { generatedImagePath, shareMetadata } from '@/lib/share';
import { neighbourScans, sameWeekScans, territoryPath } from '@/lib/related';
import { SignalLinks, TerritoryLine } from '@/components/dss/RelatedResearch';
import { JsonLd, articleLd, breadcrumbLd } from '@/lib/seo';
import { services } from '@/content/site';

export const dynamic = 'force-dynamic';

const SCAN_BOUNDARY = 'The scan frames an investigation; subsequent research must establish the evidence supporting its findings. A weekly scan entry is AI-assisted and human-reviewed. It is not a study, and it does not oblige anyone to commission one.';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const e = await getScanBySlug(params.slug);
  if (!e) return {};
  const place = territoryName[e.territory] ?? e.territory;
  // The link preview carries this signal's own title, description and image on LinkedIn and on X alike.
  const share = { path: `/research/weekly-scan/${e.slug}`, image: { url: generatedImagePath('signal', e.slug), generated: true }, publishedTime: e.week_of };
  const when = weekText(e.week_label) ?? `week of ${e.week_of}`;
  if (e.content) {
    // Each signal's own lead topic names the page, so no two territories or weeks share a title.
    const lead = e.content.lead?.title ?? e.question;
    const title = `${lead} · ${place} Weekly Signal, ${when}`;
    return shareMetadata({ ...share, pageTitle: `${title} — FalconBridge Partners`, title: lead, description: e.content.lead?.body ?? e.signal });
  }
  const title = `${e.question} · ${place} Weekly Scan, ${when}`;
  return shareMetadata({ ...share, pageTitle: `${title} — FalconBridge Partners`, title: e.question, description: e.signal });
}

export default async function ScanEntryPage({ params }: { params: { slug: string } }) {
  const e = await getScanBySlug(params.slug);
  if (!e) notFound();
  const svc = services.find((s) => s.key === e.service);
  const [study, inTerritory, all] = await Promise.all([getStudyForScan(e), getPublishedScans(e.territory), getPublishedScans()]);
  const pieces = study && e.report_id ? await getPiecesForStudy(e.report_id) : [];
  const { earlier, later } = neighbourScans(inTerritory, e);
  const sameWeek = sameWeekScans(all, e);
  const place = territoryName[e.territory] ?? e.territory;
  const when = weekText(e.week_label) ?? `week of ${e.week_of}`;
  const lead = e.content?.lead?.title ?? e.question;
  const ld = [
    breadcrumbLd([{ name: 'Research', path: '/research' }, { name: 'Weekly Signal', path: '/research/weekly-scan' }, { name: place, path: territoryPath(e.territory) }, { name: lead, path: `/research/weekly-scan/${e.slug}` }]),
    articleLd({ headline: lead, description: e.content?.lead?.body ?? e.signal, path: `/research/weekly-scan/${e.slug}`, image: generatedImagePath('signal', e.slug), published: e.week_of, section: `Weekly Signal · ${place} · ${when}` }),
  ];
  // The study a signal led to is offered at the top of the page as well as at the foot, so a reader need not scroll to find it.
  const studyCta = study && (
    <div className="mt-8">
      <Button href={`/research/studies/${study.slug}`} variant="primary" size="sm" icon={ArrowRight}>Read the study this signal led to</Button>
      <p className="text-sm text-white/55 mt-3">{study.title}</p>
    </div>
  );
  const after = (
    <>
      {study && <div className="mt-8"><NextLink href={`/research/studies/${study.slug}`} label={`The study this signal led to: ${study.title}`} sub={study.subtitle ?? 'Read the summary and get the research pack.'} /></div>}
      {pieces.map((piece) => <div key={piece.slug} className="mt-5"><NextLink href={`/research/professional-curiosity/${piece.slug}`} label={`The Professional Curiosity piece on that study: ${piece.title}`} sub="Opinion drawn from the study, in the firm’s own voice." /></div>)}
      <SignalLinks earlier={earlier} later={later} sameWeek={sameWeek} />
      {svc && <div className="mt-8"><NextLink href={`/decision-support-system/${svc.slug}`} label={`${svc.acronym} · ${svc.name}`} sub="The service closest to this question." /></div>}
      <TerritoryLine territory={e.territory} index={{ href: '/research/weekly-scan', label: 'All Weekly Signals' }} />
    </>
  );

  // A Weekly Signal carried as issued: shown in its own structure, as written.
  if (e.content) {
    const c = e.content;
    return (
      <>
        <JsonLd data={ld} />
        <PageHero
          eyebrow={['Weekly Signal', place, weekText(e.week_label) ?? `Week of ${e.week_of}`].join(' · ')}
          title={c.heading}
          governing={c.review_period ? `Review period: ${c.review_period}` : undefined}
          intro={c.briefing ?? undefined}
        >
          {studyCta}
        </PageHero>
        <Section>
          <SignalAsIssued content={c} />
          <div className="mt-14"><Band title="A scan frames an investigation" body={SCAN_BOUNDARY} /></div>
          {after}
        </Section>
        <Invitation compact />
      </>
    );
  }

  return (
    <>
      <JsonLd data={ld} />
      <PageHero eyebrow={`Weekly Scan · ${place} · Week of ${e.week_of}`} title="A signal, and the question it raises" governing={e.question} intro={e.signal}>
        {e.sample && <p className="mt-6 inline-block text-[0.7rem] text-brand-gold-pale border border-brand-gold/40 rounded-full px-3 py-1">Sample — prototype placeholder</p>}
        {studyCta}
      </PageHero>
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Tile title="What the evidence establishes" body={e.finding ?? ''} />
          <Tile title="FBP’s interpretation" body={e.interpretation ?? ''} ivory />
        </div>
        {e.open_questions.length > 0 && (
          <div className="tile p-7 mt-5">
            <h3 className="text-lg mb-3">What remains open</h3>
            <ul className="list-disc pl-5 space-y-1.5 text-white/70 text-[0.95rem]">{e.open_questions.map((q) => <li key={q}>{q}</li>)}</ul>
          </div>
        )}
        <div className="mt-10"><Band title="Findings and interpretation are kept apart" body={SCAN_BOUNDARY} /></div>
        {after}
      </Section>
      <Invitation compact />
    </>
  );
}
