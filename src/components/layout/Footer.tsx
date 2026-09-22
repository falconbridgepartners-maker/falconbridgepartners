import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Linkedin, Phone } from 'lucide-react';
import logo from '@/assets/logos/logo.png';
import { firm, services, situations } from '@/content/site';
import { getSitePartners } from '@/lib/partners';

const col = "text-white/55 hover:text-white transition-colors text-sm";

const Footer = async () => {
    const year = new Date().getFullYear();
    const partners = await getSitePartners();
    const phones = partners.filter((p) => p.phone);
    return (
        <footer className="relative bg-brand-navy pt-24 pb-10 overflow-hidden border-t border-brand-gold/15">
            <div className="max-w-300 mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-20">
                    <div className="lg:col-span-4">
                        <Link href="/" className="inline-block mb-6">
                            <Image src={logo} alt="FalconBridge Partners" className="h-[64px] w-auto" />
                        </Link>
                        <p className="text-white/55 max-w-sm text-sm leading-relaxed mb-6">
                            {firm.shortDescription}
                        </p>
                        <div className="space-y-2">
                            <a href={firm.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white">
                                <Linkedin className="w-4 h-4" /> FalconBridge Partners on LinkedIn
                            </a>
                            {(phones.length ? phones.map((p) => ({ display: p.phone!, href: `tel:${p.phone!.replace(/[^+\d]/g, '')}`, label: p.phoneLabel ?? p.locationShort })) : [firm.phone, firm.phoneUS]).map((ph) => (
                                <a key={ph.display} href={ph.href} className="flex items-center gap-2 text-sm text-white/60 hover:text-white">
                                    <Phone className="w-4 h-4" /> {ph.display} <span className="text-white/35">· {ph.label}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <h4 className="label-tech mb-6">Decision Support System™</h4>
                        <ul className="space-y-3">
                            <li><Link href="/decision-support-system" className={col}>The five services</Link></li>
                            {services.map((s) => (
                                <li key={s.key}><Link href={`/decision-support-system/${s.slug}`} className={col}>{s.acronym} · {s.short}</Link></li>
                            ))}
                            <li><Link href="/bespoke-managed-services" className={col}>Bespoke Managed Services</Link></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-3">
                        <h4 className="label-tech mb-6">Situations</h4>
                        <ul className="space-y-3">
                            {situations.map((s) => (
                                <li key={s.slug}><Link href={`/situations/${s.slug}`} className={col}>{s.short}</Link></li>
                            ))}
                        </ul>
                        <h4 className="label-tech mt-8 mb-6">Research</h4>
                        <ul className="space-y-3">
                            <li><Link href="/research" className={col}>Research capability</Link></li>
                            <li><Link href="/research/weekly-scan" className={col}>Weekly Scan</Link></li>
                            <li><Link href="/research/library" className={col}>Research library</Link></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-2">
                        <h4 className="label-tech mb-6">The firm</h4>
                        <ul className="space-y-3">
                            <li><Link href="/about" className={col}>About</Link></li>
                            <li><Link href="/working-with-falconbridge" className={col}>Working with FalconBridge</Link></li>
                            <li><Link href="/territory-partners" className={col}>Territory partners</Link></li>
                            <li><Link href="/contact" className={col}>Start a conversation</Link></li>
                            <li><Link href="/terms-of-engagement" className={col}>Terms of Engagement</Link></li>
                            <li><Link href="/privacy-policy" className={col}>Privacy Policy</Link></li>
                            <li><a href={firm.swtq.href} target="_blank" rel="noopener noreferrer" className={col}>{firm.swtq.label} ↗</a><span className="block text-xs text-white/35">{firm.swtq.note}</span></li>
                        </ul>
                        <h4 className="label-tech mt-8 mb-6">Contact</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href={`mailto:${firm.emails.general}`} className={col}>{firm.emails.general}</a><span className="block text-xs text-white/35">General enquiries</span></li>
                            {[...partners].filter((p) => p.email).reverse().map((p) => (
                                <li key={p.slug}><a href={`mailto:${p.email}`} className={col}>{p.name}</a><span className="block text-xs text-white/35">{p.shortTitle} · {p.locationShort}</span></li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="hairline mb-6" />
                <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between text-[0.72rem] text-white/40">
                    <div>&copy; {year} {firm.legalEntity}. All rights reserved.</div>
                    <div className="md:text-right">{firm.trademarkLine}<br />Research is licensed for agreed use. FalconBridge retains its intellectual property.</div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
