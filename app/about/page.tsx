import React from 'react';
import Image from 'next/image';
import { Linkedin, Mail } from 'lucide-react';
import WorkFinalCTA from '@/components/sections/WorkFinalCTA';
import heroBg from '@/assets/images/how-we-work.png';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-brand-navy">
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

                <div className="container-editorial relative z-10 text-center">
                    <div className="max-w-4xl mx-auto">
                        <span className="label-tech mb-6 inline-block">ABOUT US</span>
                        <h1 className="mb-8">A partnership built for consequence.</h1>
                        <p className="text-xl md:text-2xl font-light leading-relaxed">
                            FalconBridge Partners was founded to support leaders at moments that define their next
                            stage of growth, when capital is committed, timing matters and responsibility cannot be
                            delegated.
                        </p>
                    </div>

                    <div className="mt-20 grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-7 frosted-glass rounded-[2.5rem] p-10 md:p-12 hover:border-brand-gold/25 transition-all duration-700">
                            <span className="label-tech mb-6 text-brand-gold">Our Purpose</span>
                            <p className="text-lg md:text-xl font-light leading-relaxed text-white/70">
                                We operate quietly. There is no performance, no theatre and no unnecessary process.
                                Conversations are direct, respectful and grounded in consequence.
                            </p>
                        </div>
                        <div className="lg:col-span-5 frosted-glass rounded-[2.5rem] p-10 md:p-12 hover:border-brand-gold/25 transition-all duration-700">
                            <span className="label-tech mb-6 text-brand-gold">How We Think</span>
                            <p className="text-white/60 text-base md:text-lg font-light leading-relaxed">
                                We preserve authority while improving judgement. The decision stays with the leader.
                                The work exists to sharpen thinking, not to replace it.
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-4 frosted-glass rounded-[2.5rem] p-10 md:p-12 hover:border-brand-gold/25 transition-all duration-700">
                            <span className="label-tech mb-6 text-brand-gold">The Work</span>
                            <p className="text-white/60 text-base md:text-lg font-light leading-relaxed">
                                We integrate internal judgement, external signal and execution reality around a
                                specific decision. This work is delivered through the FalconBridge Decision System (TM).
                            </p>
                        </div>
                        <div className="lg:col-span-4 frosted-glass rounded-[2.5rem] p-10 md:p-12 hover:border-brand-gold/25 transition-all duration-700">
                            <span className="label-tech mb-6 text-brand-gold">Where We Operate</span>
                            <p className="text-white/60 text-base md:text-lg font-light leading-relaxed">
                                We are built for environments where reputational risk is real, decision cycles are
                                compressed and the cost of indecision becomes irreversible.
                            </p>
                        </div>
                        <div className="lg:col-span-4 frosted-glass rounded-[2.5rem] p-10 md:p-12 hover:border-brand-gold/25 transition-all duration-700">
                            <span className="label-tech mb-6 text-brand-gold">Who We Serve</span>
                            <p className="text-white/60 text-base md:text-lg font-light leading-relaxed">
                                We work with CEOs and founders in competitive, sensitive environments where discretion
                                is essential and decisions carry real consequence.
                            </p>
                        </div>
                    </div>

                    <div className="mt-20 frosted-glass rounded-[2.5rem] p-10 md:p-12">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                            <div className="lg:col-span-7">
                                <span className="label-tech mb-6 text-brand-gold">Trust and Discretion</span>
                                <p className="text-white/70 text-lg font-light leading-relaxed">
                                    Our clients operate in competitive and sensitive environments. Discretion is
                                    essential. We do not publish client names. We do not showcase public case studies.
                                    We do not discuss engagements outside strict boundaries.
                                </p>
                            </div>
                            <div className="lg:col-span-5 flex items-center">
                                <p className="text-brand-gold italic font-serif-accent text-xl md:text-2xl opacity-90">
                                    Trust is not a by-product of our work. It is the product.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section-padding">
                <div className="container-editorial">
                    <div className="mb-16">
                        <span className="label-tech mb-6">THE PARTNERSHIP</span>
                        <h2 className="mb-8">Founders</h2>
                        <p className="text-white/60 text-lg md:text-xl font-light leading-relaxed max-w-3xl">
                            The partnership blends decision-bound coaching with decision-led research, ensuring
                            clarity is preserved without diluting authority.
                        </p>
                    </div>

                    <div className="space-y-12">
                        <div className="frosted-glass rounded-[2.5rem] overflow-hidden">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                                <div className="lg:col-span-7 p-10 md:p-12 space-y-6">
                                    <div>
                                        <h3 className="text-2xl md:text-3xl font-technical text-white mb-2">Joel Arcus (ACC, CPQC)</h3>
                                        <p className="label-tech text-brand-gold">Co-Founder &amp; Managing Partner</p>
                                    </div>
                                    <p className="text-white/70 font-light leading-relaxed">
                                        Joel brings more than two decades of leadership, coaching and advisory experience
                                        across complex environments. His work focuses on sharpening judgement under pressure,
                                        reducing distortion and creating decision clarity that leaders can own.
                                    </p>
                                    <p className="text-white/60 font-light leading-relaxed">
                                        He operates at the intersection of human insight and structured analysis, helping
                                        leaders navigate complexity across sectors and geographies with discretion and discipline.
                                    </p>
                                    <p className="text-white/60 font-light leading-relaxed">
                                        The work is practical and decision-bound, designed to stabilise clarity, surface
                                        trade-offs and protect ownership when pressure threatens coherence.
                                    </p>
                                    <div className="flex gap-3 pt-2">
                                        <a href="https://www.linkedin.com/in/joelarcus/" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/10 border border-white/15 rounded-full hover:bg-brand-gold hover:text-brand-navy hover:border-brand-gold transition-all duration-300">
                                            <Linkedin className="w-4.5 h-4.5" />
                                        </a>
                                        <a href="mailto:joel@falconbp.com" className="p-2.5 bg-white/10 border border-white/15 rounded-full hover:bg-brand-gold hover:text-brand-navy hover:border-brand-gold transition-all duration-300">
                                            <Mail className="w-4.5 h-4.5" />
                                        </a>
                                    </div>
                                </div>
                                <div className="lg:col-span-5 relative min-h-[320px] lg:min-h-[420px]">
                                    <Image
                                        src={require('@/assets/images/joel-arcus.png')}
                                        alt="Joel Arcus (ACC, CPQC)"
                                        fill
                                        className="object-cover object-top"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-b from-transparent via-brand-navy/10 to-brand-navy/70" />
                                </div>
                            </div>
                        </div>

                        <div className="frosted-glass rounded-[2.5rem] overflow-hidden">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                                <div className="lg:col-span-5 relative min-h-[320px] lg:min-h-[420px] order-last lg:order-first">
                                    <Image
                                        src={require('@/assets/images/quincy-beukes.png')}
                                        alt="Quincy Beukes (MBA(Cum Laude), ELP, AMP, ChBP(SA))"
                                        fill
                                        className="object-cover object-top"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-b from-transparent via-brand-navy/10 to-brand-navy/70" />
                                </div>
                                <div className="lg:col-span-7 p-10 md:p-12 space-y-6">
                                    <div>
                                        <h3 className="text-2xl md:text-3xl font-technical text-white mb-2">Quincy Beukes (MBA(Cum Laude), ELP, AMP, ChBP(SA))</h3>
                                        <p className="label-tech text-brand-gold">Co-Founder &amp; Research Partner</p>
                                    </div>
                                    <p className="text-white/70 font-light leading-relaxed">
                                        Quincy brings deep international experience across finance, strategy and private
                                        capital. His focus is transforming complex external signal into decision-grade
                                        clarity that can be used at the point of commitment.
                                    </p>
                                    <p className="text-white/60 font-light leading-relaxed">
                                        He combines commercial acumen with rigorous diagnostic insight, ensuring research
                                        is decision-led, restrained and aligned to the authority of the leader.
                                    </p>
                                    <p className="text-white/60 font-light leading-relaxed">
                                        The result is structured signal that clarifies options, exposes second-order effects
                                        and strengthens decision ownership without replacing judgement.
                                    </p>
                                    <div className="flex gap-3 pt-2">
                                        <a href="https://www.linkedin.com/in/quincy-jc-beukes/" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/10 border border-white/15 rounded-full hover:bg-brand-gold hover:text-brand-navy hover:border-brand-gold transition-all duration-300">
                                            <Linkedin className="w-4.5 h-4.5" />
                                        </a>
                                        <a href="mailto:quincy@falconbp.com" className="p-2.5 bg-white/10 border border-white/15 rounded-full hover:bg-brand-gold hover:text-brand-navy hover:border-brand-gold transition-all duration-300">
                                            <Mail className="w-4.5 h-4.5" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <WorkFinalCTA />
        </div>
    );
}




