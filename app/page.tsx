import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Compass from '@/components/dss/Compass';
import Invitation from '@/components/dss/Invitation';
import PartnerCard from '@/components/dss/PartnerCard';
import { Section, Tile, NextLink } from '@/components/dss/Tiles';
import Image from 'next/image';
import falconMark from '@/assets/images/falcon-mark.png';
import { firm, forces, situations, humanAuthority, origins, partners, serviceByKey } from '@/content/site';
import { getFeaturedReport, getSiteSettings, publicMediaUrl, territoryName } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [featuredStudy, settings] = await Promise.all([getFeaturedReport(), getSiteSettings()]);
  return (
    <>
      {/* Hero — the approved client promise */}
      <section className="relative min-h-[calc(88vh-6.5rem)] flex items-center pt-14 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-navy-dark via-brand-navy to-brand-navy pointer-events-none" />
        <div className="absolute right-[-4rem] top-28 w-[34rem] pointer-events-none hidden lg:block select-none" aria-hidden="true">
          <Image src={falconMark} alt="" className="w-full h-auto opacity-[0.07]" priority />
        </div>
        <div className="container-editorial relative z-10">
          <div className="max-w-4xl animate-fade-in-up">
            <p className="label-tech mb-6">FalconBridge Partners</p>
            <h1 className="text-[clamp(2.6rem,6vw,5.2rem)] leading-[1.05] mb-2">Sharper thinking when</h1>
            <p className="governing text-[clamp(2.2rem,5.2vw,4.6rem)] leading-[1.05] mb-8">the decision stays with you</p>
            <p className="text-white/80 text-xl md:text-2xl max-w-2xl mb-10">{firm.subline}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button href="/contact" variant="primary" size="md" icon={ArrowRight}>{firm.invitation.cta}</Button>
              <Button href="/decision-support-system" variant="secondary" size="md" icon={ArrowRight}>The Decision Support System</Button>
            </div>
          </div>
        </div>
      </section>

      {/* The partnership — evidence, judgement, execution reality */}
      <Section eyebrow="The partnership" title="Evidence, judgement and the capacity to act" intro="FalconBridge brings experienced people and proprietary methods to the questions that shape a business.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {forces.map((f) => (
            <Tile key={f.key} ivory>
              <p className="governing text-brand-charcoal text-2xl mb-4" style={{ color: '#262626' }}>{f.title}</p>
              {f.questions.map((q) => <p key={q} className="mb-1.5">{q}</p>)}
            </Tile>
          ))}
        </div>
        <p className="mt-8 text-white/70 max-w-4xl">{firm.integration}</p>
        <p className="governing text-xl md:text-2xl mt-6 max-w-4xl">{firm.clarityLine}</p>
      </Section>

      {/* Who we serve — four situations */}
      <Section eyebrow="Who we serve" title="The situation defines the starting point" intro="We work with people putting forward, evaluating or acting on a consequential proposition.">
        <p className="governing text-xl md:text-2xl mb-8 max-w-4xl">{firm.environmentLine}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {situations.map((s) => (
            <Link key={s.slug} href={`/situations/${s.slug}`} className="group tile p-7 md:p-8 hover:border-brand-gold/60 transition-colors">
              <h3 className="text-xl mb-2">{s.short}</h3>
              <p className="text-white/65 mb-5">{s.audience}</p>
              <p className="governing text-lg leading-snug mb-4">{s.opening}</p>
              <span className="inline-flex items-center gap-2 text-sm text-brand-gold-pale">Read the situation <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
            </Link>
          ))}
        </div>
      </Section>

      {/* Decision Support System */}
      <Section eyebrow="FalconBridge Decision Support System™" title="Five services, available independently" intro="Enter where the need arises. Combine services by choice.">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6">
            <Compass />
          </div>
          <div className="lg:col-span-6 space-y-6">
            {forces.map((f) => (
              <div key={f.key}>
                <p className="label-tech mb-3">{f.grouping}</p>
                <div className="space-y-2">
                  {f.services.map((k) => {
                    const s = serviceByKey(k);
                    return (
                      <Link key={k} href={`/decision-support-system/${s.slug}`} className="group flex items-baseline gap-4 py-2 border-b border-brand-gold/15 hover:border-brand-gold/50 transition-colors">
                        <span className="font-technical font-bold text-brand-gold-pale w-16 shrink-0">{s.acronym}</span>
                        <span className="text-white font-bold">{s.name}</span>
                        <span className="text-white/55 text-sm ml-auto text-right hidden md:block">{s.summary}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
            <p className="text-white/60 text-sm pt-2">Experienced partners lead the work. Proprietary systems and AI assist delivery, with humans in control and involved throughout. <Link href="/bespoke-managed-services" className="text-brand-gold-pale underline underline-offset-4">Bespoke Managed Services</Link> is a separate category.</p>
          </div>
        </div>
      </Section>

      {/* Philosophy */}
      <Section eyebrow="Our philosophy" title="Human authority in AI-assisted work" intro="Experience, expertise and professional networks guide the use of FBP’s proprietary systems.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {humanAuthority.map((h) => <Tile key={h.title} title={h.title} body={h.body} />)}
        </div>
        <p className="mt-8 text-white/70">AI assists discovery, analysis and production. Coaching and advisory remain human relationships. The client retains the decision.</p>
        <p className="governing text-xl md:text-2xl mt-4">{firm.whoWeAreNot.closing}</p>
      </Section>

      {/* Research in practice */}
      <Section eyebrow="Research in practice" title="Depth that the reader can examine" intro="We also fund studies into questions we consider worth investigating and make selected full reports available to readers.">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {featuredStudy && <div className="lg:col-span-7 tile p-8 md:p-10">
            <p className="label-tech mb-3">{territoryName[featuredStudy.territory] ?? featuredStudy.territory} · FBP-commissioned study</p>
            <h3 className="text-2xl md:text-3xl mb-3">{featuredStudy.title}</h3>
            <p className="text-white/70 mb-8">{featuredStudy.subtitle}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {featuredStudy.facts.map((f) => (
                <div key={f.figure} className="border-t border-brand-gold/30 pt-4">
                  <p className="governing text-xl mb-1">{f.figure}</p>
                  <p className="text-sm text-white/60">{f.body}</p>
                </div>
              ))}
            </div>
            <Link href={`/research/studies/${featuredStudy.slug}`} className="inline-flex items-center gap-2 text-brand-gold-pale mt-8 text-sm">Examine the study <ArrowRight className="w-4 h-4" /></Link>
          </div>}
          <div className="lg:col-span-5 grid grid-cols-1 gap-5">
            <Tile ivory>
              <p className="governing text-3xl mb-1" style={{ color: '#262626' }}>{origins.milestones[2].figure}</p>
              <h3 className="text-lg mb-2">Research reports</h3>
              <p className="text-sm">{origins.milestones[2].body}</p>
            </Tile>
            <NextLink href="/research/weekly-scan" label="Weekly Scan" sub="Territorial signals turned into decision-relevant questions." />
            <NextLink href="/research/library" label="Research library" sub="Public studies, samples and papers available to readers." />
          </div>
        </div>
      </Section>

      {/* Partners */}
      <Section eyebrow="The partners" title="Experience with personal accountability" intro="Quincy and Joel are the founding partners. Wayne extends the partnership into North America.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {partners.map((p) => <PartnerCard key={p.slug} partner={p} portrait={publicMediaUrl(settings.portraits[p.image ?? ''])} />)}
        </div>
        <div className="mt-8">
          <Link href="/about" className="inline-flex items-center gap-2 text-brand-gold-pale text-sm">About FalconBridge — origins, philosophy and where we work <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </Section>

      <Invitation />
    </>
  );
}
