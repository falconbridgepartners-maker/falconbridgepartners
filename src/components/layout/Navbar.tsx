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
    const [scrolled, setScrolled] = useState(false);   // > 20px: pill condenses (existing behaviour)
    const [elevated, setElevated] = useState(false);   // > 8px: subtle shadow on the floating bar
    const [hidden, setHidden] = useState(false);       // hides on scroll down, returns on scroll up (as stwtq.com)
    const lastY = useRef(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            const y = window.scrollY;
            setScrolled(y > 20);
            setElevated(y > 8);
            const delta = y - lastY.current;
            if (y <= 80) setHidden(false);                 // always visible near the top
            else if (delta > 4) { setHidden(true); setOpenDropdown(null); }   // scrolling down
            else if (delta < -4) setHidden(false);         // scrolling up
            lastY.current = y;
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
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
        <nav
            className={cn(
                "sticky top-0 z-50 w-full transition-all duration-500 bg-brand-navy/80 backdrop-blur-md border-b border-brand-gold/15",
                scrolled ? "py-3" : "py-6",
                elevated && "shadow-sm shadow-black/40",
                hidden && !menuOpen && "-translate-y-full shadow-none"
            )}
        >
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

            {/* The nav's backdrop-filter makes it the containing block for fixed
                children, so a `fixed` sheet is measured against the bar and collapses
                to zero height. Anchor it to the bar instead: `top-full` starts it at
                the bar's bottom edge and `100dvh - 100%` (100% = the bar's own height)
                fills the rest of the viewport at either bar size. */}
            {menuOpen && (
                <div
                    className="lg:hidden absolute inset-x-0 top-full h-[calc(100dvh-100%)] z-40 bg-brand-navy overflow-y-auto overscroll-contain border-t border-brand-gold/15"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Site menu"
                >
                    <div className="relative px-6 pt-8 pb-10 space-y-6">
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
