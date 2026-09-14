import React from 'react';
import Image from 'next/image';
import heroBg from '@/assets/images/how-we-work.png';

export default function TermsOfEngagementPage() {
    return (
        <section className="relative pt-48 pb-24 overflow-hidden bg-brand-navy">
            <div className="absolute inset-0 z-0">
                <Image
                    src={heroBg}
                    alt=""
                    fill
                    className="object-cover opacity-40 grayscale"
                    priority
                />
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
                            These Terms of Engagement govern services provided by FalconBridge Partners FZC LLC. FalconBridge provides decision support services designed to strengthen judgement while preserving the authority of the client.
                        </p>
                    </div>
                </div>

                <div className="space-y-10 max-w-3xl text-left mx-auto mt-16">
                    <div className="text-white/50 text-sm font-light">
                        FalconBridge Partners FZC LLC
                        <span className="mx-2 text-white/30">&#8226;</span>
                        Last updated: 14 September 2026
                    </div>

                    <p className="text-white/60 font-light leading-relaxed">
                        By engaging FalconBridge Partners FZC LLC (&quot;FalconBridge&quot;, &quot;we&quot;, &quot;us&quot;), you agree to these Terms. Where a separate written scope, proposal or engagement letter exists, it will define the deliverables, fees and timelines for that engagement.
                    </p>

                    <section className="space-y-4">
                        <h2 className="text-2xl md:text-3xl font-technical text-white">1. Nature of Services</h2>
                        <p className="text-white/60 font-light leading-relaxed">
                            FalconBridge provides decision support services, including decision-bound executive coaching, decision-led research and analysis and strategic advisory aligned to defined decision frames.
                        </p>
                        <p className="text-white/60 font-light leading-relaxed">
                            We do not assume decision-making authority. All final decisions remain the responsibility of the client.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl md:text-3xl font-technical text-white">2. Scope of Engagement</h2>
                        <p className="text-white/60 font-light leading-relaxed">
                            Each engagement is defined by a specific decision frame, scope and agreed deliverables. Any expansion of scope must be agreed in writing.
                        </p>
                        <p className="text-white/60 font-light leading-relaxed">
                            Unless otherwise agreed in writing, services are advisory in nature and outputs are prepared for the client&apos;s internal use. No guarantee of outcome is provided.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl md:text-3xl font-technical text-white">3. Professional Boundaries</h2>
                        <p className="text-white/60 font-light leading-relaxed">
                            FalconBridge does not provide legal advice, tax advice, investment advice, medical advice or psychological treatment. Clients are responsible for seeking independent professional advice where required.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl md:text-3xl font-technical text-white">4. Decision Responsibility</h2>
                        <p className="text-white/60 font-light leading-relaxed">
                            FalconBridge provides structured insight, analysis and perspective. Responsibility for interpretation, implementation, financial outcomes, legal consequences and operational execution remains solely with the client.
                        </p>
                        <p className="text-white/60 font-light leading-relaxed">
                            Our work is designed to strengthen judgement, not replace it.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl md:text-3xl font-technical text-white">5. Confidentiality</h2>
                        <p className="text-white/60 font-light leading-relaxed">
                            All engagements are confidential. FalconBridge will not disclose client information, engagement details or deliverables without explicit consent, except where required by law.
                        </p>
                        <p className="text-white/60 font-light leading-relaxed">
                            Clients agree to treat FalconBridge methodologies and proprietary materials as confidential.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl md:text-3xl font-technical text-white">6. Fees and Payment</h2>
                        <p className="text-white/60 font-light leading-relaxed">
                            Fees, payment terms and scope are defined in individual engagement agreements. Unless otherwise specified, fees are exclusive of applicable taxes and invoices are payable within the agreed timeframe. Late payments may result in suspension of services.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl md:text-3xl font-technical text-white">7. Limitation of Liability</h2>
                        <p className="text-white/60 font-light leading-relaxed">
                            To the fullest extent permitted by applicable law, FalconBridge shall not be liable for indirect, consequential or reputational loss.
                        </p>
                        <p className="text-white/60 font-light leading-relaxed">
                            Liability for any claim arising from an engagement shall be limited to the total fees paid for that engagement.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl md:text-3xl font-technical text-white">8. Intellectual Property</h2>
                        <p className="text-white/60 font-light leading-relaxed">
                            All systems, methodologies and proprietary materials, including the Decision Support System and the Global Discovery Research System (GDRS), remain the intellectual property of FalconBridge. The client receives agreed rights to use the work. For research, the default licence is Type-1 for the specified purpose; additional internal uses, external circulation, reproduction, publication or exclusivity require the appropriate agreed rights and may attract additional fees. For execution tools, editing, updating and team-access rights are agreed in the engagement terms. For bespoke programmes, branding, attribution, exclusivity and continuing use are defined in the signed engagement and licence.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl md:text-3xl font-technical text-white">9. Termination</h2>
                        <p className="text-white/60 font-light leading-relaxed">
                            Either party may terminate an engagement in writing in accordance with the agreed scope terms. Fees for work completed up to the date of termination remain payable.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl md:text-3xl font-technical text-white">10. Governing Law</h2>
                        <p className="text-white/60 font-light leading-relaxed">
                            These Terms of Engagement are governed by the laws of the United Arab Emirates. Any disputes shall be subject to the jurisdiction of the competent courts of the UAE.
                        </p>
                    </section>

                    <p className="text-white/60 font-light leading-relaxed">
                        FalconBridge Partners provides research and strategic support for consequential business decisions, combining experienced human judgement with proprietary, AI-assisted methods. Client information and commissioned work stay within agreed disclosure boundaries.
                    </p>
                </div>
            </div>
        </section>
    );
}
