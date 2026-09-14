"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import logo from '@/assets/logos/logo.png';
import { nav } from '@/content/site';

const Navbar: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!menuOpen) return;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    const open = (label: string) => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        setOpenDropdown(label);
    };
    const scheduleClose = () => {
        closeTimer.current = setTimeout(() => setOpenDropdown(null), 160);
    };

    const linkClass = "text-[0.8rem] font-medium text-white/70 px-4 py-2.5 rounded-full hover:text-white hover:bg-white/5 transition-all whitespace-nowrap";

    return (
        <nav className={cn("fixed top-0 left-0 w-full z-1000 transition-all duration-500", scrolled ? "py-3" : "py-6")}>
            <div className={cn(
                "mx-auto px-6 flex justify-between items-center transition-all duration-500",
                scrolled
                    ? "max-w-[1200px] bg-brand-navy/80 border border-brand-gold/20 backdrop-blur-xl rounded-full shadow-lg shadow-black/30 px-6 py-2"
                    : "max-w-300"
            )}>
                <Link href="/" className="flex items-center gap-3" aria-label="FalconBridge Partners — home">
                    <Image src={logo} alt="FalconBridge Partners" className="h-[54px] w-auto" priority />
                </Link>

                <button
                    type="button"
                    className="lg:hidden p-2 rounded-full border border-brand-gold/20 bg-white/5 text-white/80 hover:text-white transition-all"
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                    onClick={() => setMenuOpen((p) => !p)}
                >
                    {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>

                <div className="hidden lg:flex items-center bg-white/3 border border-brand-gold/15 backdrop-blur-xl p-1.5 rounded-full">
                    <ul className="flex items-center gap-1 list-none">
                        {nav.primary.map((item) => (
                            <li
                                key={item.label}
                                className="relative"
                                onMouseEnter={() => item.children && open(item.label)}
                                onMouseLeave={() => item.children && scheduleClose()}
                            >
                                {item.children ? (
                                    <>
                                        <Link
                                            href={item.href}
                                            className={cn(linkClass, "inline-flex items-center gap-1.5")}
                                            aria-haspopup="true"
                                            aria-expanded={openDropdown === item.label}
                                            onFocus={() => open(item.label)}
                                        >
                                            {item.label}
                                            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                                        </Link>
                                        {openDropdown === item.label && (
                                            <div
                                                className="absolute left-0 top-full pt-3 w-[22rem]"
                                                onMouseEnter={() => open(item.label)}
                                                onMouseLeave={scheduleClose}
                                            >
                                                <ul className="tile p-2 list-none shadow-2xl">
                                                    <li>
                                                        <Link href={item.href} className="block px-4 py-2.5 rounded-lg text-[0.8rem] font-bold text-white hover:bg-white/5">
                                                            The five services
                                                        </Link>
                                                    </li>
                                                    {item.children.map((child) => (
                                                        <li key={child.href}>
                                                            <Link href={child.href} className="block px-4 py-2.5 rounded-lg text-[0.8rem] text-white/75 hover:text-white hover:bg-white/5">
                                                                {child.label}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <Link href={item.href} className={linkClass}>{item.label}</Link>
                                )}
                            </li>
                        ))}
                        <li>
                            <Button href={nav.cta.href} variant="primary" size="sm" icon={ArrowRight}>
                                {nav.cta.label}
                            </Button>
                        </li>
                    </ul>
                </div>
            </div>

            {menuOpen && (
                <div className="lg:hidden fixed inset-0 z-50 bg-brand-navy overflow-y-auto">
                    <div className="relative px-6 pt-24 pb-10 space-y-6">
                        <button
                            type="button"
                            className="absolute top-6 right-6 p-2 rounded-full border border-brand-gold/20 bg-white/5 text-white/80"
                            aria-label="Close menu"
                            onClick={() => setMenuOpen(false)}
                        >
                            <X className="w-5 h-5" />
                        </button>
                        {nav.primary.map((item) => (
                            <div key={item.label} className="space-y-3">
                                <Link href={item.href} onClick={() => setMenuOpen(false)} className="block text-white text-base font-bold">
                                    {item.label}
                                </Link>
                                {item.children && (
                                    <div className="pl-4 space-y-2 border-l border-brand-gold/25">
                                        {item.children.map((child) => (
                                            <Link key={child.href} href={child.href} onClick={() => setMenuOpen(false)} className="block text-white/70 text-sm">
                                                {child.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        <Button href={nav.cta.href} variant="primary" size="sm" icon={ArrowRight} className="w-full justify-center" onClick={() => setMenuOpen(false)}>
                            {nav.cta.label}
                        </Button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
