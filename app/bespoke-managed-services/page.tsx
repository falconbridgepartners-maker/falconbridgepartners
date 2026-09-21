import type { Metadata } from 'next';
import PageHero from '@/components/dss/PageHero';
import Invitation from '@/components/dss/Invitation';
import { Section, Tile, ThreeColumns, Band, NextLink } from '@/components/dss/Tiles';
import { bespoke } from '@/content/site';

export const metadata: Metadata = {
  title: 'Bespoke Managed Services — FalconBridge Partners',
  description: bespoke.intro,
};

export default function BespokePage() {
  return (
    <>
      <PageHero eyebrow="A separate category" title={bespoke.heading} intro={bespoke.intro} />
      <Section>
        <ThreeColumns items={bespoke.columns} />
        <div className="mt-10"><Band title={bespoke.noteTitle} body={bespoke.note} /></div>
      </Section>
      <Section eyebrow="A programme designed around your priorities" title="Direction, delivery and publication responsibilities made explicit">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {bespoke.detail.map((d) => <Tile key={d.title} title={d.title} body={d.body} />)}
        </div>
        <p className="governing text-2xl mt-12 mb-2">Intelligence Research as a Service (IRaaS)</p>
        <p className="text-white/70 max-w-3xl">In development. Bespoke programmes sit separately from the five-service Decision Support System.</p>
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
