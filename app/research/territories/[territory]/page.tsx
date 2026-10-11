import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHero from '@/components/dss/PageHero';
import Invitation from '@/components/dss/Invitation';
import ReportCard from '@/components/dss/ReportCard';
import { Section, NextLink } from '@/components/dss/Tiles';
import { PieceLinks } from '@/components/dss/RelatedResearch';
import { TERRITORIES, weekText } from '@/lib/data';
import { getTerritoryHub, scanTitle, territoryLabel, territoryPath } from '@/lib/related';
import { JsonLd, breadcrumbLd } from '@/lib/seo';
import { services } from '@/content/site';

export const dynamic = 'force-dynamic';

const SIGNALS_SHOWN = 8;

export function generateMetadata({ params }: { params: { territory: string } }): Metadata {
  const name = territoryLabel(params.territory);
  const path = territoryPath(params.territory);
  const title = `${name}: Weekly Signals, studies and opinion — FalconBridge Partners`;
  const description = `FalconBridge Partners research on ${name}: the Weekly Signal each week, the studies it led to and the Professional Curiosity pieces drawn from them.`;
  return { title, description, alternates: { canonical: path }, openGraph: { title, description, url: path, type: 'website' } };
}

/**
 * One territory's research in one place: its signals week by week, the studies they led to, the pieces written on
 * those studies and the partner who covers it. Every signal, study and piece links back here.
 */
export default async function TerritoryPage({ params }: { params: { territory: string } }) {
  const hub = await getTerritoryHub(params.territory);
  if (!hub) notFound();
  const { name, scans, reports, pieces, partners } = hub;
  const signals = scans.filter((s) => !s.sample);
  const others = TERRITORIES.filter((t) => t.value !== hub.territory);
  const raas = services.find((s) => s.key === 'raas');
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: 'Research', path: '/research' }, { name, path: territoryPath(hub.territory) }])} />
      <PageHero
        eyebrow={`Research · ${name}`}
        title={name}
        governing={`${signals.length} Weekly Signal${signals.length === 1 ? '' : 's'} · ${reports.length} stud${reports.length === 1 ? 'y' : 'ies'} · ${pieces.length} piece${pieces.length === 1 ? '' : 's'}`}
        intro={`Everything FalconBridge has published on ${name}: the Weekly Signal each week, the studies those signals led to and the Professional Curiosity pieces drawn from them. Findings and the firm’s interpretation are kept visibly apart throughout.`}
      />

      {signals.length > 0 && (
        <Section eyebrow="Weekly Signal" title={`The signals from ${name}`} intro="Systematic scans of the territory, with the FalconBridge Lens turning a development into a question worth testing.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {signals.slice(0, SIGNALS_SHOWN).map((s) => <NextLink key={s.id} href={`/research/weekly-scan/${s.slug}`} label={scanTitle(s)} sub={weekText(s.week_label) ?? `Week of ${s.week_of}`} />)}
          </div>
          {signals.length > SIGNALS_SHOWN && <p className="text-sm text-white/45 mt-6"><Link href={`/research/weekly-scan?territory=${hub.territory}`} className="text-brand-gold-pale underline underline-offset-4">All {signals.length} signals from {name}</Link></p>}
        </Section>
      )}

      {reports.length > 0 && (
        <Section eyebrow="Studies" title={`The studies on ${name}`} intro="Each study began as a Weekly Signal. The summary is open; the research pack is available to readers who ask for it.">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">{reports.map((r) => <ReportCard key={r.id} report={r} />)}</div>
          <p className="text-sm text-white/45 mt-6"><Link href={`/research/library?territory=${hub.territory}`} className="text-brand-gold-pale underline underline-offset-4">{name} in the research library</Link></p>
        </Section>
      )}

      {pieces.length > 0 && (
        <Section eyebrow="Professional Curiosity" title={`Opinion drawn from the ${name} studies`}>
          <PieceLinks pieces={pieces} heading="" />
        </Section>
      )}

      <Section eyebrow="Who covers it" title={partners.length ? `${partners.map((p) => p.name).join(' and ')} ${partners.length > 1 ? 'cover' : 'covers'} ${name}` : `Working with FalconBridge on ${name}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {partners.map((p) => <NextLink key={p.slug} href="/about" label={p.name} sub={`${p.title} · ${p.location}`} />)}
          {raas && <NextLink href={`/decision-support-system/${raas.slug}`} label={`${raas.acronym} · ${raas.name}`} sub="A bespoke study on a question of your own, delivered as a complete research package." />}
          <NextLink href="/working-with-falconbridge" label="Working with FalconBridge" sub="How an engagement is defined, agreed and completed." />
        </div>
        <p className="text-sm text-white/45 mt-8">
          Other territories:{' '}
          {others.map((t, i) => <span key={t.value}>{i > 0 ? ' · ' : ''}<Link href={territoryPath(t.value)} className="text-brand-gold-pale underline underline-offset-4">{t.label}</Link></span>)}
        </p>
      </Section>
      <Invitation compact />
    </>
  );
}
