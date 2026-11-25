import React from 'react';
import PageHero from '@/components/dss/PageHero';
import { Section } from '@/components/dss/Tiles';
import { aiRows, audiences, commonTerms, intro, statements, summaryRows, types, ways } from '@/content/researchLicences';
import { AED_PRICES, usdFromAed, REDUCTION } from '@/lib/licencePricing';

export const metadata = {
  title: 'Research Licences — FalconBridge Partners',
  description: 'How FalconBridge research may be used: the four licence types, who may see a report, systems and AI, prices and the Common Terms.',
  alternates: { canonical: '/legal/research-licences' },
};

const h2 = 'text-2xl md:text-3xl mb-5';
const p = 'text-white/70 leading-relaxed max-w-[76ch]';
const th = 'text-left p-3 text-xs uppercase tracking-wider text-brand-gold font-semibold align-bottom';
const td = 'p-3 text-sm text-white/80 align-top';
const row = 'border-t border-white/10';

const usd = (aed: number) => `US$${usdFromAed(aed).toLocaleString('en-US')}`;
const red = (aed: number) => usd(aed * (1 - REDUCTION));
const priceRows: { t: string; cells: string[] }[] = [
  { t: 'Type 1: FREE', cells: ['—', '—', usd(0), usd(0), usd(0), usd(0)] },
  { t: 'Type 2: Single Use', cells: [AED_PRICES.commissioned.t2, AED_PRICES.new.t2, AED_PRICES.back.t2].flatMap((a) => [usd(a), red(a)]) },
  { t: 'Type 3: Multi-Use', cells: [AED_PRICES.commissioned.t3, AED_PRICES.new.t3, AED_PRICES.back.t3].flatMap((a) => [usd(a), red(a)]) },
  { t: 'Type 4: Exclusive', cells: [usd(AED_PRICES.commissioned.t4), red(AED_PRICES.commissioned.t4), '✗', '✗', '✗', '✗'] },
];

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto tile">
      <table className="w-full min-w-[640px] border-collapse">
        <thead><tr>{head.map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export default function ResearchLicencesPage() {
  return (
    <>
      <PageHero eyebrow="FalconBridge Partners · Legal" title="Research Licences" governing="Version 1.0. How you may use the research reports we prepare, and the licence that fits your purpose." />
      <Section>
        <div className="space-y-16">
          <section aria-labelledby="l1">
            <h2 id="l1" className={h2}>1. Introduction</h2>
            <div className="space-y-4">{intro.map((t) => <p key={t} className={p}>{t}</p>)}</div>
          </section>

          <section aria-labelledby="l2">
            <h2 id="l2" className={h2}>2. Two ways to obtain our research</h2>
            <Table head={['', 'Ready-made reports', 'Commissioned studies']}>
              {ways.map((w) => <tr key={w.a} className={row}><td className={`${td} text-white`}>{w.a}</td><td className={td}>{w.b}</td><td className={td}>{w.c}</td></tr>)}
            </Table>
            <p className={`${p} mt-4 text-sm`}>Commissioned studies held under a Type 2 or Type 3 licence may later join our ready-made library, but only after 90 days and only in an anonymised form that never identifies the client or discloses its confidential information.</p>
          </section>

          <section aria-labelledby="l3">
            <h2 id="l3" className={h2}>3. Who may see the report</h2>
            <p className={`${p} mb-5`}>Each licence is defined by who may see the report. To choose a licence, ask: “Who will see this?”</p>
            <Table head={['Audience', 'Who', 'Control']}>
              {audiences.map((a) => <tr key={a.a} className={row}><td className={`${td} text-white whitespace-pre`}>{a.a}</td><td className={td}>{a.b}</td><td className={td}>{a.c}</td></tr>)}
            </Table>
          </section>

          <section aria-labelledby="l4">
            <h2 id="l4" className={h2}>4. Licence types</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {types.map((t) => (
                <div key={t.name} className="tile p-6">
                  <p className="label-tech mb-2">{t.term}</p>
                  <p className="text-white text-lg font-bold mb-2">{t.name}</p>
                  <p className="text-sm text-white/70">{t.desc}</p>
                </div>
              ))}
            </div>
            <p className={`${p} mt-5`}>You can upgrade at any time by paying only the difference in price. The upgraded licence runs from your original licence date.</p>
          </section>

          <section aria-labelledby="l5">
            <h2 id="l5" className={h2}>5. Summary of licence terms</h2>
            <Table head={['', 'Type 1: FREE', 'Type 2: Single Use', 'Type 3: Multi-Use', 'Type 4: Exclusive']}>
              {summaryRows.map((r, i) => r.g
                ? <tr key={i} className="border-t border-white/10 bg-white/[0.04]"><td colSpan={5} className="p-3 text-xs uppercase tracking-wider text-brand-gold font-semibold">{r.g}</td></tr>
                : <tr key={i} className={row}><td className={`${td} text-white`}>{r.a}</td><td className={td}>{r.b}</td><td className={td}>{r.c}</td><td className={td}>{r.d}</td><td className={td}>{r.e}</td></tr>)}
            </Table>
            <p className={`${p} mt-4 text-sm`}>FalconBridge retains ownership of the research under every licence.</p>
          </section>

          <section aria-labelledby="l6">
            <h2 id="l6" className={h2}>6. Electronic systems and AI</h2>
            <Table head={['Level', 'Examples', 'Permitted']}>
              {aiRows.map((a) => <tr key={a.a} className={row}><td className={`${td} text-white whitespace-pre`}>{a.a}</td><td className={td}>{a.b}</td><td className={td}>{a.c}</td></tr>)}
            </Table>
            <p className={`${p} mt-4`}><span className="text-white font-semibold">Derivative output.</span> Any summary, translation, rewording or other output derived from a report, whether produced by hand or with AI, remains derived from FalconBridge research. FalconBridge retains all rights in it. It must credit FalconBridge as the source and may be used only within the licence purchased.</p>
          </section>

          <section aria-labelledby="l7">
            <h2 id="l7" className={h2}>7. Prices</h2>
            <p className={`${p} mb-5`}>Prices are in US$, excluding VAT. Reduced prices apply to buyers registered in countries the World Bank does not classify as high income (upper-middle, lower-middle and low income), based on the World Bank’s current country income classification.</p>
            <Table head={['Licence', 'Commissioned', 'Commissioned (reduced)', 'Ready-made, new', 'Ready-made, new (reduced)', 'Back catalogue', 'Back catalogue (reduced)']}>
              {priceRows.map((r) => <tr key={r.t} className={row}><td className={`${td} text-white`}>{r.t}</td>{r.cells.map((c, i) => <td key={i} className={`${td} whitespace-nowrap`}>{c}</td>)}</tr>)}
            </Table>
            <p className={`${p} mt-4 text-sm`}>Reduced prices are 40% below the standard price.</p>
            <ol className="list-decimal pl-6 mt-4 space-y-2 text-sm text-white/70 max-w-[76ch]">
              <li>Back catalogue: ready-made reports become back-catalogue reports three months after publication.</li>
              <li>Currency: prices are set in US dollars. You may pay in your local currency, converted at checkout. Buyers in the UAE pay UAE VAT at 5%.</li>
              <li>Payment: ready-made reports are paid in full before delivery and delivered digitally. Commissioned studies are invoiced as set out in the proposal and Terms of Engagement.</li>
              <li>Exclusivity or public use: available only by commissioning a study under a Type 4 licence.</li>
            </ol>
          </section>

          <section aria-labelledby="l8">
            <h2 id="l8" className={h2}>8. Common Terms</h2>
            <p className={`${p} mb-2`}>These Common Terms apply to every FalconBridge research licence and form part of each licence statement in section 9.</p>
            <p className="text-white font-semibold mb-5">FalconBridge Research Licence: Common Terms (Version 1.0)</p>
            <ol className="space-y-4 max-w-[76ch]">
              {commonTerms.map((t) => <li key={t.n} className="flex gap-3 text-white/70 leading-relaxed"><span className="text-brand-gold shrink-0 w-6">{t.n}</span><span><span className="text-white font-semibold">{t.h}</span> {t.t}</span></li>)}
            </ol>
          </section>

          <section aria-labelledby="l9">
            <h2 id="l9" className={h2}>9. Licence statements</h2>
            <p className={`${p} mb-6`}>Every FalconBridge report carries the statement for the licence issued with it. Details shown in [brackets] are completed for each licensee. A short notice also appears on the report’s cover or footer.</p>
            <div className="space-y-6">
              {statements.map((st) => (
                <article key={st.title} className="tile p-6 md:p-8 space-y-4">
                  <h3 className="text-xl">{st.title}</h3>
                  {st.blocks.map((b, i) => (
                    <div key={i} className="space-y-1.5">
                      {b.h && <p className="text-brand-gold font-semibold text-sm tracking-wide">{b.h}</p>}
                      {b.items.map((it) => <p key={it.t} className={`text-white/75 max-w-[76ch] ${it.bullet ? 'pl-4' : ''} ${it.note ? 'text-sm italic' : ''}`}>{it.t}</p>)}
                    </div>
                  ))}
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="l10">
            <h2 id="l10" className={h2}>10. Conclusion</h2>
            <div className="space-y-4">
              <p className={p}>FalconBridge is a service-oriented firm focused on long-term, mutually beneficial relationships. One size does not fit all, so we welcome clients with specific needs to discuss them with us where these licences do not meet their requirements.</p>
              <p className={p}>We review these terms periodically to keep them aligned with a changing global market. We hope our research helps you make better-informed decisions, subject to the disclaimers in each assignment.</p>
              <p className={p}>Thank you for choosing FalconBridge. For further usage rights, upgrades or a commissioned study, please contact <a href="mailto:joel@falconbp.com" className="text-brand-gold-pale underline underline-offset-4">joel@falconbp.com</a>.</p>
              <p className="text-white/45 text-sm">Research Licences© · E&amp;OE | All Rights Strictly Reserved</p>
            </div>
          </section>
        </div>
      </Section>
    </>
  );
}
