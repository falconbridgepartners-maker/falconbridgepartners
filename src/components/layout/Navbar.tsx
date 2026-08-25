"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import logo from '@/assets/logos/logo.png';

const Navbar: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!menuOpen) return;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, [menuOpen]);

    return (
        <nav className={cn(
            "fixed top-0 left-0 w-full z-1000 transition-all duration-500",
            scrolled ? "py-4" : "py-8"
        )}>
            <div className={cn(
                "mx-auto px-6 flex justify-between items-center transition-all duration-500",
                scrolled
                    ? "max-w-[1200px] bg-white/5 border border-white/10 backdrop-blur-xl rounded-full shadow-lg shadow-black/20 px-6 py-3"
                    : "max-w-300"
            )}>
                <div className="nav-brand">
                    <Link href="/" className="flex items-center gap-3">
                        <Image src={logo} alt="FalconBridge Partners" className="h-[60px] w-auto" />
                    </Link>
                </div>

                <button
                    type="button"
                    className="md:hidden p-2 rounded-full border border-white/10 bg-white/5 text-white/80 hover:text-white hover:border-white/20 transition-all"
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                    onClick={() => setMenuOpen((prev) => !prev)}
                >
                    {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>

                <div className="hidden md:flex items-center bg-white/3 border border-white/8 backdrop-blur-xl p-1.5 rounded-full">
                    <ul className="flex items-center gap-2 list-none">
                        <li>
                            <Link href="/" className="text-[0.8rem] font-medium text-white/70 px-5 py-2.5 rounded-full hover:text-white hover:bg-white/5 transition-all">
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link href="/how-we-work" className="text-[0.8rem] font-medium text-white/70 px-5 py-2.5 rounded-full hover:text-white hover:bg-white/5 transition-all">
                                How We Work
                            </Link>
                        </li>
                        <li>
                            <Link href="/insights" className="text-[0.8rem] font-medium text-white/70 px-5 py-2.5 rounded-full hover:text-white hover:bg-white/5 transition-all">
                                Insights
                            </Link>
                        </li>
                        <li>
                            <Link href="/about" className="text-[0.8rem] font-medium text-white/70 px-5 py-2.5 rounded-full hover:text-white hover:bg-white/5 transition-all">
                                About Us
                            </Link>
                        </li>
                        <li>
                            <Button href="/contact" variant="primary" size="sm" icon={ArrowRight}>
                                Book A Clarity Call
                            </Button>
                        </li>
                    </ul>
                </div>
            </div>

            {menuOpen && (
                <div className="md:hidden fixed inset-0 z-50 bg-brand-navy/95 backdrop-blur-xl">
                    <div className="absolute inset-0 bg-brand-navy" />
                    <div className="relative px-6 pt-28 pb-10 space-y-6">
                        <button
                            type="button"
                            className="absolute top-6 right-6 p-2 rounded-full border border-white/10 bg-white/5 text-white/80 hover:text-white hover:border-white/20 transition-all"
                            aria-label="Close menu"
                            onClick={() => setMenuOpen(false)}
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <Link href="/" onClick={() => setMenuOpen(false)} className="block text-white/80 text-sm font-technical uppercase tracking-widest">
                            Home
                        </Link>
                        <Link href="/how-we-work" onClick={() => setMenuOpen(false)} className="block text-white/80 text-sm font-technical uppercase tracking-widest">
                            How We Work
                        </Link>
                        <Link href="/insights" onClick={() => setMenuOpen(false)} className="block text-white/80 text-sm font-technical uppercase tracking-widest">
                            Insights
                        </Link>
                        <Link href="/about" onClick={() => setMenuOpen(false)} className="block text-white/80 text-sm font-technical uppercase tracking-widest">
                            About Us
                        </Link>
                        <Button href="/contact" variant="primary" size="sm" icon={ArrowRight} className="w-full justify-center" onClick={() => setMenuOpen(false)}>
                            Book A Clarity Call
                        </Button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
