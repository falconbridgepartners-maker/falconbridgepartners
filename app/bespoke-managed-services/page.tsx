import type { Metadata } from 'next';
import PageHero from '@/components/dss/PageHero';
import Invitation from '@/components/dss/Invitation';
import { Section, Tile, ThreeColumns, Band, NextLink } from '@/components/dss/Tiles';
import { acronymize } from '@/components/dss/acronymize';
import { bespoke } from '@/content/site';

export const metadata: Metadata = {
  title: 'Intelligence Research as a Service — FalconBridge Partners',
  description: bespoke.intro,
};

export default function BespokePage() {
  return (
    <>
      <PageHero eyebrow="IRaaS · An emerging application" title={bespoke.heading} intro={bespoke.intro} />
      <Section>
        <ThreeColumns items={bespoke.columns} />
        <div className="mt-10"><Band title={bespoke.noteTitle} body={bespoke.note} /></div>
      </Section>
      <Section eyebrow="A programme designed around your priorities" title="Direction, delivery and publication responsibilities made explicit">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {bespoke.detail.map((d) => <Tile key={d.title} title={d.title} body={d.body} />)}
        </div>
        <p className="governing text-2xl mt-12 mb-2">{acronymize('Intelligence Research as a Service (IRaaS)')}</p>
        <p className="text-white/70 max-w-3xl">{acronymize('In development. IRaaS programmes sit separately from the five-service Decision Support System.')}</p>
      </Section>
      <Section eyebrow="Related">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <NextLink href="/research/weekly-scan" label="Weekly Scan" sub="The public expression of the scanning capability behind IRaaS." />
          <NextLink href="/decision-support-system/research" label="RaaS · Research as a Service" sub="The six-part package a programme applies when it commissions a GDRS study." />
        </div>
      </Section>
      <Invitation compact />
    </>
  );
}
