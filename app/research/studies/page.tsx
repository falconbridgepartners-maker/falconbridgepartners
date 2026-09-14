import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import PageHero from '@/components/dss/PageHero';
import Invitation from '@/components/dss/Invitation';
import { Section, Band } from '@/components/dss/Tiles';
import { research } from '@/content/site';
import { getAllStudies, territoryName } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Public studies — FalconBridge Partners',
  description: 'Selected FBP-funded GDRS investigations, made available to readers with the full research package.',
};

export default async function StudiesPage() {
  const studies = await getAllStudies();
  return (
    <>
      <PageHero eyebrow="Research · Public studies" title="Studies available to readers" intro={research.publicNote} />
      <Section>
        <div className="grid grid-cols-1 gap-5">
          {studies.map((s) => (
            <Link key={s.slug} href={`/research/studies/${s.slug}`} className="group tile p-8 md:p-10 block hover:border-brand-gold/60 transition-colors">
              <p className="label-tech mb-3">{territoryName[s.territory] ?? s.territory} · FBP-commissioned study</p>
              <h3 className="text-2xl md:text-3xl mb-2">{s.title}</h3>
              <p className="text-white/70 mb-6">{s.subtitle}</p>
              <span className="inline-flex items-center gap-2 text-sm text-brand-gold-pale">Examine the study <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
            </Link>
          ))}
        </div>
        <div className="mt-10">
          <Band title="Research is licensed for agreed use" body="FBP retains its research IP. Broader circulation, publication, reproduction or exclusivity must follow the agreed licence. Availability of a public download does not transfer ownership." />
        </div>
      </Section>
      <Invitation compact />
    </>
  );
}
