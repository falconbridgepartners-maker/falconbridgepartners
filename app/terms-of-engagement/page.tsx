import React from 'react';
import Image from 'next/image';
import heroBg from '@/assets/images/how-we-work.png';
import { firm } from '@/content/site';

export const metadata = { title: 'Terms of Engagement — FalconBridge Partners' };

const LAST_UPDATED = '22 September 2026';

type Section = { title: string; paras: React.ReactNode[] };

const p = 'text-white/60 font-light leading-relaxed';
const Strong = ({ children }: { children: React.ReactNode }) => <span className="text-white/80 font-normal">{children}</span>;

const sections: Section[] = [
    {
        title: '1. Who we are and what these Terms cover',
        paras: [
            'These Terms of Engagement ("Terms") govern all services provided by FalconBridge Partners FZC LLC ("FalconBridge", "FBP", "we", "us") and by any territory partner acting under a written agreement with FalconBridge. By commissioning work from FalconBridge you ("the client", "you") agree to these Terms.',
            'Each engagement is also governed by a written scope — a proposal, engagement letter or signed engagement and licence — that sets out the decision the work is anchored to, the deliverables, fees, timelines and use rights for that engagement. Where the written scope and these Terms differ, the written scope prevails for that engagement.',
        ],
    },
    {
        title: '2. What FalconBridge does',
        paras: [
            'FalconBridge provides decision support for consequential business decisions. Our services are anchored to the decision a leader is actually making and are available independently or in combination:',
            <ul key="svc" className="list-disc pl-6 space-y-2">
                <li><Strong>Critical Evaluation (CEaaS)</Strong> — evaluation of the substantiation behind a proposition, and prioritisation of the gaps.</li>
                <li><Strong>Research (RaaS)</Strong> — investigation of a defined question, delivered as a structured research package with a separate reference and link audit.</li>
                <li><Strong>Coaching (CaaS)</Strong> — confidential, decision-bound executive coaching.</li>
                <li><Strong>Execution Modelling (EMaaS)</Strong> — models and tools that test whether a direction can be delivered.</li>
                <li><Strong>Advisory (AaaS)</Strong> — structured strategic advisory within a defined decision frame.</li>
            </ul>,
            'Recurring and bespoke arrangements, including managed intelligence programmes, are provided under a separately agreed programme scope.',
        ],
    },
    {
        title: '3. What FalconBridge does not do',
        paras: [
            'We do not make decisions on your behalf and we do not assume decision-making authority. All decisions, and responsibility for their consequences, remain with you.',
            'We do not provide legal, tax, accounting, audit, investment, valuation, medical or psychological services, and nothing we deliver should be treated as such. A Critical Evaluation does not include audit, due diligence, valuation, legal verification or technical certification unless expressly agreed. A reference and link audit is a source-checking exercise within a stated scope; it is not third-party certification of every calculation or inference.',
            'Where a decision requires regulated or specialist advice, you are responsible for obtaining it.',
        ],
    },
    {
        title: '4. Scope and change',
        paras: [
            'Every engagement starts with a written scope that defines the decision frame, the question or proposition, the deliverables, the intended recipients of the work and the intended use. Work outside that scope, including additional questions, formats, audiences or uses, must be agreed in writing and may attract additional fees.',
            'A Critical Evaluation may produce a closure agenda identifying further work. It does not oblige you to commission that work from FalconBridge.',
            'For managed programmes, the programme scope defines territories and topics, sponsorship, selection and review points, cadence and capacity, outputs, publication approval, fees and change control. No universal turnaround or volume is assumed.',
        ],
    },
    {
        title: '5. Evidence, interpretation and limitations',
        paras: [
            'Our research separates what the evidence establishes from FalconBridge\u2019s interpretation of it. Findings carry a date and a scope. Contradictions, uncertainty and access limits remain part of the record and are disclosed rather than smoothed over.',
            'Research reflects the sources available and accessible at the time of the work. Circumstances, data and sources change. You are responsible for judging whether a finding remains current before relying on it for a decision taken later or for a different purpose.',
            <><Strong>Source and correction queries.</Strong> If you question a source or a finding, provide the report version, page, reference and the point in question. We will investigate source access and what the evidence supports, and correct material errors. A link becoming inaccessible after delivery does not by itself establish that the underlying claim is false.</>,
        ],
    },
    {
        title: '6. Human judgement and supporting technology',
        paras: [
            'People govern scope, review and every material judgement in our work. FalconBridge uses proprietary, AI-assisted methods to support research and analysis; their use respects the purpose and confidentiality of the engagement, and outputs are reviewed by a partner before delivery. Coaching and advisory are human relationships and are not delegated to automated systems.',
        ],
    },
    {
        title: '7. Confidentiality',
        paras: [
            'All engagements are confidential. Client information, the existence and content of an engagement, and commissioned deliverables stay within the disclosure boundaries agreed in the written scope. We will not disclose them without your written consent, except where required by law or a competent authority.',
            'FalconBridge\u2019s self-funded public studies have a different provenance from client-commissioned work and are never derived from a client\u2019s confidential commission.',
            'You agree to treat FalconBridge\u2019s methodologies, systems and proprietary materials as confidential and not to disclose them beyond the recipients agreed for the engagement.',
            'Coaching engagements are confidential between the coach and the individual client. Where an organisation sponsors coaching for an individual, the boundaries of what may be reported to the sponsor are agreed in writing before the engagement begins.',
        ],
    },
    {
        title: '8. Ownership and use rights',
        paras: [
            'FalconBridge retains ownership of all intellectual property in its systems, methodologies, frameworks and materials, including the Decision Support System\u2122, the Global Discovery Research System (GDRS) and the structure of its deliverables. You receive a licence to use the work as agreed; receipt of a deliverable does not transfer ownership and does not permit unrestricted internal or external reuse.',
            <><Strong>Research.</Strong> The default licence is Type-1: use for the specified purpose by the recipients named in the written scope. Additional internal uses, circulation to advisers, funders or other external parties, reproduction, publication, adaptation or exclusivity require the appropriate agreed rights and may attract additional fees. Public availability of a FalconBridge study on our website or elsewhere does not transfer ownership or permit republication.</>,
            <><Strong>Execution tools and models.</Strong> Editing, updating and team-access rights are defined in the engagement terms. Unless agreed, tools are delivered for the client\u2019s internal use by named users.</>,
            <><Strong>Bespoke programmes.</Strong> Branding, FalconBridge attribution, permitted audiences, internal or public use, exclusivity, and rights after any exclusive period are defined in the signed engagement and licence.</>,
            <><Strong>Client materials.</Strong> You retain ownership of the information and materials you provide. You grant FalconBridge the right to use them for the purpose of the engagement.</>,
            'Tell us at the start who needs access to the work and whether it will support internal decisions, advisers, funding discussions, client communication or public publication. Agreeing intended use before the work begins is faster and cheaper than extending rights afterwards.',
        ],
    },
    {
        title: '9. Your responsibilities',
        paras: [
            'You are responsible for the accuracy and completeness of the information you provide, for the decisions you take, and for interpretation, implementation, financial outcomes, legal and regulatory consequences and operational execution. You will make available the people, information and access reasonably needed to complete the agreed scope within the agreed timeline.',
        ],
    },
    {
        title: '10. Fees and payment',
        paras: [
            'Fees, invoicing and payment terms are set out in the written scope. Unless otherwise stated, fees are quoted exclusive of VAT and other applicable taxes, and invoices are payable within 14 days of the invoice date. Expenses agreed in the written scope are recharged at cost.',
            'If an invoice is overdue, FalconBridge may suspend work and withhold deliverables until payment is received. Fees for work completed to the date of any suspension or termination remain payable. Delays caused by late information or access from the client may lead to a revised timeline and, where material, revised fees.',
        ],
    },
    {
        title: '11. Liability',
        paras: [
            'FalconBridge will perform its services with reasonable skill and care. No outcome is guaranteed. Our work is designed to strengthen your judgement, not to replace it.',
            'To the fullest extent permitted by applicable law:',
            <ul key="liab" className="list-disc pl-6 space-y-2">
                <li>FalconBridge is not liable for any indirect, consequential, special or reputational loss, or for loss of profit, revenue, opportunity or goodwill, however arising.</li>
                <li>FalconBridge\u2019s total liability for all claims arising from an engagement is limited to the fees paid by you for that engagement.</li>
                <li>FalconBridge is not liable for decisions taken, or actions not taken, in reliance on its work, or for the use of any deliverable outside the scope, purpose or recipients agreed in the written scope.</li>
            </ul>,
            'Nothing in these Terms limits liability that cannot be limited under applicable law.',
        ],
    },
    {
        title: '12. Territory partners',
        paras: [
            'FalconBridge operates through territory partners appointed under written agreements with FalconBridge Partners FZC LLC. Territory partners deliver under FalconBridge\u2019s systems, brand and standards. Unless the written scope states otherwise, your contract is with FalconBridge Partners FZC LLC and these Terms apply in every territory.',
        ],
    },
    {
        title: '13. Termination',
        paras: [
            'Either party may terminate an engagement by written notice in accordance with the notice period in the written scope, or on 14 days\u2019 notice where none is stated. Fees for work completed to the date of termination, and any non-cancellable commitments made for the engagement, remain payable. Sections 7, 8, 11 and 14 survive termination.',
        ],
    },
    {
        title: '14. Governing law',
        paras: [
            'These Terms and every engagement under them are governed by the laws of the United Arab Emirates. Any dispute is subject to the exclusive jurisdiction of the competent courts of the UAE.',
        ],
    },
    {
        title: '15. Changes to these Terms',
        paras: [
            'FalconBridge may update these Terms from time to time. The version published at falconbp.com on the date an engagement is agreed applies to that engagement.',
        ],
    },
    {
        title: '16. Contact',
        paras: [
            <>Questions about these Terms, or about use rights for a deliverable: <a href={`mailto:${firm.emails.general}`} className="text-brand-gold hover:text-white transition-colors">{firm.emails.general}</a>, or your engagement partner.</>,
        ],
    },
];

export default function TermsOfEngagementPage() {
    return (
        <section className="relative pt-20 pb-24 overflow-hidden bg-brand-navy">
            <div className="absolute inset-0 z-0">
                <Image src={heroBg} alt="" fill className="object-cover opacity-40 grayscale" priority />
                <div className="absolute inset-0 bg-linear-to-b from-brand-navy via-brand-navy/40 to-brand-navy" />
                <div className="absolute inset-0 bg-linear-to-r from-brand-navy via-transparent to-brand-navy opacity-80" />
            </div>

            <div className="max-w-300 mx-auto px-6 relative z-10 text-center">
                <div className="max-w-4xl mx-auto">
                    <span className="text-brand-gold font-technical text-[0.6rem] tracking-[0.4em] uppercase mb-10 block opacity-80">
                        TERMS OF ENGAGEMENT
                    </span>
                    <h1 className="text-5xl md:text-7xl font-technical mb-12 leading-[1.1] tracking-tight">
                        <span className="text-white">Decision support</span><br className="hidden md:block" />{' '}
                        <span className="text-brand-gold italic font-serif-accent opacity-90">and boundaries.</span>
                    </h1>
                    <div className="max-w-3xl mx-auto">
                        <p className="text-white/60 text-lg md:text-xl font-light leading-relaxed">
                            These Terms govern every service FalconBridge Partners FZC LLC provides. They exist to make two things explicit: what we deliver and how you may use it, and that the decision, and its consequences, remain yours.
                        </p>
                    </div>
                </div>

                <div className="space-y-10 max-w-3xl text-left mx-auto mt-16">
                    <div className="text-white/50 text-sm font-light">
                        {firm.legalEntity}
                        <span className="mx-2 text-white/30">&#8226;</span>
                        Ajman Free Zone, United Arab Emirates
                        <span className="mx-2 text-white/30">&#8226;</span>
                        Last updated: {LAST_UPDATED}
                    </div>

                    {sections.map((s) => (
                        <section key={s.title} className="space-y-4">
                            <h2 className="text-2xl md:text-3xl font-technical text-white">{s.title}</h2>
                            {s.paras.map((para, i) => (typeof para === 'string' ? <p key={i} className={p}>{para}</p> : <div key={i} className={p}>{para}</div>))}
                        </section>
                    ))}
                </div>
            </div>
        </section>
    );
}
