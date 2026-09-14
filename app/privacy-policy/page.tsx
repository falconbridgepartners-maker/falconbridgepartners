import React from 'react';
import Image from 'next/image';
import heroBg from '@/assets/images/how-we-work.png';

export default function PrivacyPolicyPage() {
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
                    <span className="text-brand-gold font-technical text-[0.6rem] tracking-[0.4em] uppercase mb-10 block opacity-80">PRIVACY POLICY</span>
                    <h1 className="text-5xl md:text-7xl font-technical mb-12 leading-[1.1] tracking-tight">
                        <span className="text-white">Privacy and</span><br className="hidden md:block" />{' '}
                        <span className="text-brand-gold italic font-serif-accent opacity-90">discretion.</span>
                    </h1>
                    <div className="max-w-3xl mx-auto">
                        <p className="text-white/60 text-lg md:text-xl font-light leading-relaxed">
                            FalconBridge Partners operates a private, low-volume engagement model. We collect limited
                            personal information only where necessary and handle it with discretion.
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
                        This policy explains what information we collect, how it is used and how it is protected.
                    </p>

                    <section className="space-y-4">
                        <h2 className="text-2xl md:text-3xl font-technical text-white">1. Information We Collect</h2>
                        <p className="text-white/60 font-light leading-relaxed">We may collect:</p>
                        <ul className="space-y-3 text-white/60 font-light leading-relaxed list-disc pl-5">
                            <li>Name and contact details</li>
                            <li>Professional information voluntarily shared during enquiries</li>
                            <li>Information provided during an engagement</li>
                            <li>Basic website analytics data where applicable</li>
                        </ul>
                        <p className="text-white/60 font-light leading-relaxed">
                            We do not collect unnecessary personal data. We do not conduct behavioural profiling. We do not monetise personal information.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl md:text-3xl font-technical text-white">2. How Information Is Used</h2>
                        <p className="text-white/60 font-light leading-relaxed">Personal information is used solely for:</p>
                        <ul className="space-y-3 text-white/60 font-light leading-relaxed list-disc pl-5">
                            <li>Responding to enquiries</li>
                            <li>Delivering agreed services</li>
                            <li>Maintaining professional communication</li>
                            <li>Meeting legal or regulatory obligations</li>
                        </ul>
                        <p className="text-white/60 font-light leading-relaxed">
                            We do not sell, rent, trade or share personal information for marketing purposes.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl md:text-3xl font-technical text-white">3. Confidentiality and Discretion</h2>
                        <p className="text-white/60 font-light leading-relaxed">
                            FalconBridge Partners operates in environments where discretion is essential. Client information is accessed only by the partners directly involved in the engagement, unless otherwise agreed.
                        </p>
                        <p className="text-white/60 font-light leading-relaxed">
                            We do not publish client names. We do not disclose engagement details without explicit consent. Confidentiality is a baseline expectation.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl md:text-3xl font-technical text-white">4. Use of Technology and AI</h2>
                        <p className="text-white/60 font-light leading-relaxed">
                            We use AI-assisted tools to support research, synthesis and analysis. All outputs are human-reviewed, curated and contextualised before delivery.
                        </p>
                        <ul className="space-y-3 text-white/60 font-light leading-relaxed list-disc pl-5">
                            <li>Client data is not used to train AI models</li>
                            <li>Sensitive or identifying information is not uploaded to external systems where avoidable</li>
                            <li>AI tools are used to accelerate structured insight, not to replace judgement</li>
                        </ul>
                        <p className="text-white/60 font-light leading-relaxed">
                            Responsibility for decision-making remains with the client.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl md:text-3xl font-technical text-white">5. Data Security</h2>
                        <p className="text-white/60 font-light leading-relaxed">
                            We implement reasonable technical and organisational safeguards to protect information from unauthorised access, misuse, alteration or disclosure. Access to sensitive information is limited and controlled.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl md:text-3xl font-technical text-white">6. Data Retention</h2>
                        <p className="text-white/60 font-light leading-relaxed">
                            Information is retained only for as long as necessary to fulfil the purpose for which it was collected, comply with legal obligations and maintain appropriate professional records. Data that is no longer required is securely deleted.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl md:text-3xl font-technical text-white">7. Your Rights</h2>
                        <p className="text-white/60 font-light leading-relaxed">
                            You may request access to, correction of, or deletion of your personal information by contacting us at info@falconbp.com. We will respond within a reasonable timeframe, subject to applicable legal obligations.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl md:text-3xl font-technical text-white">8. Jurisdiction</h2>
                        <p className="text-white/60 font-light leading-relaxed">
                            FalconBridge Partners FZC LLC operates in the United Arab Emirates. This policy is governed by applicable UAE data protection regulations.
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
