import type { Metadata } from 'next';
import PageHero from '@/components/dss/PageHero';
import Invitation from '@/components/dss/Invitation';
import { Section, Tile, Band } from '@/components/dss/Tiles';
import { firm, workingWith } from '@/content/site';

export const metadata: Metadata = {
  title: 'Working with FalconBridge — FalconBridge Partners',
  description: workingWith.intro,
};

export default function WorkingWithPage() {
  return (
    <>
      <PageHero eyebrow="How an engagement works" title={workingWith.heading} intro={workingWith.intro} />
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {workingWith.steps.map((s, i) => (
            <div key={s.title} className="tile-ivory p-7">
              <p className="governing text-xl mb-2" style={{ color: '#262626' }}>{String(i + 1).padStart(2, '0')}</p>
              <h3 className="text-lg mb-2">{s.title}</h3>
              <p className="text-[0.95rem]">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 space-y-8">
          <Band title={workingWith.completionTitle} body={workingWith.completion} />
          <Band title="No dependency by design" body={firm.noDependency} />
          <Band title="We will say so" body={firm.honestFit} />
        </div>
      </Section>
      <Section eyebrow="Trust, rights and questions" title="Agree how the work may be used before it is circulated or relied upon for a different purpose">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {workingWith.rights.map((r) => <Tile key={r.title} title={r.title} body={r.body} />)}
        </div>
        <div className="mt-10"><Band title={workingWith.planTitle} body={workingWith.plan} /></div>
      </Section>
      <Section eyebrow="Fit">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Tile title={workingWith.fit.title} body={workingWith.fit.body} />
          <Tile title={workingWith.advisers.title} body={workingWith.advisers.body} />
        </div>
      </Section>
      <Invitation compact />
    </>
  );
}
