import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/dss/PageHero';
import Compass from '@/components/dss/Compass';
import Invitation from '@/components/dss/Invitation';
import { Section, Tile, Band, NextLink } from '@/components/dss/Tiles';
import { firm, forces, humanAuthority, serviceByKey } from '@/content/site';

export const metadata: Metadata = {
  title: 'Decision Support System — FalconBridge Partners',
  description: 'Five services, available independently: Critical Evaluation, Research, Coaching, Execution Modelling and Advisory. Enter where the need arises and combine services by choice.',
};

export default function DSSPage() {
  return (
    <>
      <PageHero
        eyebrow="FalconBridge Decision Support System™"
        title="Five services, available independently"
        governing="Enter where the need arises. Combine services by choice."
        intro="Experienced partners lead the work. Proprietary systems and AI assist delivery, with humans in control and involved throughout. Your decision remains yours."
      />

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5"><Compass /></div>
          <div className="lg:col-span-7 space-y-10">
            {forces.map((f) => (
              <div key={f.key}>
                <div className="flex items-baseline gap-4 mb-4">
                  <p className="label-tech">{f.grouping}</p>
                  <p className="text-white/45 text-sm">{f.questions.join(' ')}</p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {f.services.map((k) => {
                    const s = serviceByKey(k);
                    return (
                      <Link key={k} href={`/decision-support-system/${s.slug}`} className="group tile p-6 hover:border-brand-gold/60 transition-colors">
                        <div className="flex items-baseline gap-4">
                          <span className="font-technical font-bold text-xl text-brand-gold-pale">{s.acronym}</span>
                          <span className="text-white font-bold text-lg">{s.name}</span>
                        </div>
                        <p className="governing text-lg leading-snug mt-3 mb-2">{s.governingQuestion}</p>
                        <p className="text-sm text-white/60">{s.summary}</p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section eyebrow="How the groupings work">
        <div className="space-y-8">
          <Band title="The groupings show each service’s primary emphasis" body="External signal primarily connects CEaaS and RaaS. Internal judgement centres on CaaS. Execution reality primarily connects EMaaS and AaaS. These emphases help explain the architecture without isolating the services from one another. There is no mandatory sequence of service purchases." />
          <Band title="Coaching sits on either side of research" body="Coaching is used before research, to clarify what must be known to decide responsibly, and after research, to integrate the evidence into a decision the leader can own. Neither requires the other; each is anchored to the same decision." />
          <Band title={firm.whoWeAreNot.heading} body={`${firm.whoWeAreNot.items.map((i) => i.title.replace('Not ', 'not ')).join('; ')}. ${firm.whoWeAreNot.closing}`} />
        </div>
      </Section>

      <Section eyebrow="Our philosophy" title="Human authority in AI-assisted work">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {humanAuthority.map((h) => <Tile key={h.title} title={h.title} body={h.body} />)}
        </div>
      </Section>

      <Section eyebrow="A separate category">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <NextLink href="/bespoke-managed-services" label="Bespoke Managed Services" sub="Client-specific programmes using FBP’s systems and IP under agreed licence. Intelligence Research as a Service (IRaaS) is in development." />
          <NextLink href="/working-with-falconbridge" label="Working with FalconBridge" sub="How an engagement is defined, agreed and completed." />
        </div>
      </Section>

      <Invitation />
    </>
  );
}
