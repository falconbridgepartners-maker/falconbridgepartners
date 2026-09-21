import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import PageHero from '@/components/dss/PageHero';
import Invitation from '@/components/dss/Invitation';
import { Section, Band } from '@/components/dss/Tiles';
import { firm, situations, workingWith } from '@/content/site';

export const metadata: Metadata = {
  title: 'Who we serve — FalconBridge Partners',
  description: 'A proposition to substantiate, a proposition to evaluate, a decision to own, a direction to make workable. The situation defines the starting point.',
};

export default function SituationsPage() {
  return (
    <>
      <PageHero eyebrow="Who we serve" title="The situation defines the starting point" intro="We work with people putting forward, evaluating or acting on a consequential proposition. Sector, geography and business maturity refine the context. They do not, by themselves, determine fit." />
      <Section>
        <p className="governing text-xl md:text-2xl mb-10 max-w-4xl">{firm.environmentLine}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {situations.map((s) => (
            <Link key={s.slug} href={`/situations/${s.slug}`} className="group tile p-8 hover:border-brand-gold/60 transition-colors">
              <h3 className="text-xl mb-2">{s.title}</h3>
              <p className="text-white/65 mb-5">{s.audience}</p>
              <p className="governing text-lg leading-snug mb-4">{s.opening}</p>
              <span className="inline-flex items-center gap-2 text-sm text-brand-gold-pale">Read the situation <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
            </Link>
          ))}
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Band title={workingWith.fit.title} body={workingWith.fit.body} />
          <Band title={workingWith.advisers.title} body={workingWith.advisers.body} />
        </div>
      </Section>
      <Invitation compact />
    </>
  );
}
