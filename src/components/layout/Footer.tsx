import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, Linkedin } from 'lucide-react';
import logo from '@/assets/logos/logo.png';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="relative bg-brand-navy pt-32 pb-0 overflow-hidden">
            {/* Large Background Text */}
            <div className="absolute bottom-0 left-0 right-0 pointer-events-none opacity-[0.02] flex items-end justify-center p-0">
                <h2 className="font-technical text-[clamp(6rem,15vw,12rem)] font-bold text-white whitespace-nowrap leading-none p-0 m-0">
                    FALCONBRIDGE
                </h2>
            </div>

            <div className="max-w-300 mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
                    <div className="lg:col-span-2">
                        <Link href="/" className="inline-block mb-8">
                            <Image src={logo} alt="FalconBridge Partners" className="h-[70px] w-auto" />
                        </Link>
                        <p className="text-white/40 max-w-sm font-light leading-relaxed mb-10 text-sm">
                            A private strategic partnership providing boardroom clarity and
                            intelligence-grade research for leaders in moments of consequence.
                            Discreet, rigorous and referral-only.
                        </p>
                        <div className="flex gap-3">
                            <a href="https://www.linkedin.com/company/falconbps" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-full hover:bg-brand-gold hover:text-brand-navy transition-all">
                                <Linkedin className="w-4 h-4" />
                            </a>
                            <a href="mailto:engagements@falconbp.com" className="p-3 bg-white/5 rounded-full hover:bg-brand-gold hover:text-brand-navy transition-all">
                                <Mail className="w-4 h-4" />
                            </a>
                            <a href="tel:+971527068408" className="p-3 bg-white/5 rounded-full hover:bg-brand-gold hover:text-brand-navy transition-all">
                                <Phone className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-technical text-sm uppercase tracking-widest mb-8 text-brand-gold">The Partnership</h4>
                        <ul className="space-y-4">
                            <li><Link href="/about" className="text-white/50 hover:text-white transition-colors text-sm">About Us</Link></li>
                            <li><Link href="/privacy-policy" className="text-white/50 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
                            <li><Link href="/terms-of-engagement" className="text-white/50 hover:text-white transition-colors text-sm">Terms of Engagement</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-technical text-sm uppercase tracking-widest mb-8 text-brand-gold">Engagement</h4>
                        <ul className="space-y-4">
                            <li><Link href="/contact" className="text-white/50 hover:text-white transition-colors text-sm">Book a Clarity Call</Link></li>
                            <li><Link href="/how-we-work" className="text-white/50 hover:text-white transition-colors text-sm">How We Work</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-12 pb-48">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                        <div className="text-[0.7rem] font-technical uppercase tracking-widest text-white/20 text-center md:text-left">
                            &copy; {currentYear} FALCONBRIDGE PARTNERS
                        </div>

                        <div className="text-[0.65rem] font-technical text-brand-gold/40 uppercase tracking-[0.2em] text-center">
                            All engagements are confidential and by referral or introduction only.
                        </div>

                        <div className="text-[0.65rem] text-white/20 text-center md:text-right">
                            Website designed by{' '}
                            <a 
                                href="https://nurudigitalmarketing.com" 
                                target="_blank" 
                                rel="dofollow" 
                                className="text-brand-gold/60 hover:text-brand-gold transition-colors"
                            >
                                Nuru Digital
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
