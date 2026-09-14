import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PageHero from '@/components/dss/PageHero';
import Invitation from '@/components/dss/Invitation';
import { Section, Tile, Band } from '@/components/dss/Tiles';
import { sampleScans } from '@/content/site';

export function generateStaticParams() {
  return sampleScans.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const e = sampleScans.find((x) => x.slug === params.slug);
  if (!e) return {};
  return { title: `${e.territory} · ${e.week} — Weekly Scan — FalconBridge Partners`, description: e.question };
}

export default function ScanEntryPage({ params }: { params: { slug: string } }) {
  const e = sampleScans.find((x) => x.slug === params.slug);
  if (!e) notFound();
  return (
    <>
      <PageHero eyebrow={`Weekly Scan · ${e.territory} · ${e.week}`} title="A signal, and the question it raises" governing={e.question} intro={e.signal}>
        <p className="mt-6 inline-block text-[0.7rem] text-brand-gold-pale border border-brand-gold/40 rounded-full px-3 py-1">Sample — prototype placeholder</p>
      </PageHero>
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Tile title="What the evidence establishes" body={e.finding} />
          <Tile title="FBP’s interpretation" body={e.interpretation} ivory />
        </div>
        <div className="tile p-7 mt-5">
          <h3 className="text-lg mb-3">What remains open</h3>
          <ul className="list-disc pl-5 space-y-1.5 text-white/70 text-[0.95rem]">
            {e.openQuestions.map((q) => <li key={q}>{q}</li>)}
          </ul>
        </div>
        <div className="mt-10">
          <Band title="Findings and interpretation are kept apart" body="The scan frames an investigation; subsequent research must establish the evidence supporting its findings. A weekly scan entry is AI-assisted and human-reviewed. It is not a study, and it does not oblige anyone to commission one." />
        </div>
        <p className="text-sm text-white/45 mt-8"><Link href="/research/weekly-scan" className="text-brand-gold-pale underline underline-offset-4">All scan entries</Link></p>
      </Section>
      <Invitation compact />
    </>
  );
}
