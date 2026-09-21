import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PageHero from '@/components/dss/PageHero';
import Invitation from '@/components/dss/Invitation';
import { Section, Tile, Band, NextLink } from '@/components/dss/Tiles';
import { getScanBySlug, territoryName } from '@/lib/data';
import { services } from '@/content/site';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const e = await getScanBySlug(params.slug);
  if (!e) return {};
  return { title: `${territoryName[e.territory] ?? e.territory} · Week of ${e.week_of} — Weekly Scan — FalconBridge Partners`, description: e.question };
}

export default async function ScanEntryPage({ params }: { params: { slug: string } }) {
  const e = await getScanBySlug(params.slug);
  if (!e) notFound();
  const svc = services.find((s) => s.key === e.service);
  return (
    <>
      <PageHero eyebrow={`Weekly Scan · ${territoryName[e.territory] ?? e.territory} · Week of ${e.week_of}`} title="A signal, and the question it raises" governing={e.question} intro={e.signal}>
        {e.sample && <p className="mt-6 inline-block text-[0.7rem] text-brand-gold-pale border border-brand-gold/40 rounded-full px-3 py-1">Sample — prototype placeholder</p>}
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
        <div className="mt-10"><Band title="Findings and interpretation are kept apart" body="The scan frames an investigation; subsequent research must establish the evidence supporting its findings. A weekly scan entry is AI-assisted and human-reviewed. It is not a study, and it does not oblige anyone to commission one." /></div>
        {svc && <div className="mt-8"><NextLink href={`/decision-support-system/${svc.slug}`} label={`${svc.acronym} · ${svc.name}`} sub="The service closest to this question." /></div>}
        <p className="text-sm text-white/45 mt-8"><Link href="/research/weekly-scan" className="text-brand-gold-pale underline underline-offset-4">All scan entries</Link></p>
      </Section>
      <Invitation compact />
    </>
  );
}
