import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Tile: React.FC<{ title?: string; body?: string; ivory?: boolean; className?: string; children?: React.ReactNode }> = ({ title, body, ivory, className, children }) => (
    <div className={cn(ivory ? "tile-ivory" : "tile", "p-7 md:p-8", className)}>
        {title && <h3 className="text-lg md:text-xl mb-3">{title}</h3>}
        {body && <p className="text-[0.95rem] md:text-base leading-relaxed">{body}</p>}
        {children}
    </div>
);

export const ThreeColumns: React.FC<{ items: { title: string; body: string }[]; ivory?: boolean }> = ({ items, ivory }) => (
    <div className={cn("grid grid-cols-1 gap-5", items.length === 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3")}>
        {items.map((it) => <Tile key={it.title} title={it.title} body={it.body} ivory={ivory} />)}
    </div>
);

/** Full-width emphasis band — used for boundary statements. */
export const Band: React.FC<{ title: string; body: string }> = ({ title, body }) => (
    <div className="border-l-2 border-brand-gold pl-6 md:pl-8 py-1">
        <h3 className="text-lg md:text-xl mb-2">{title}</h3>
        <p className="text-white/70 max-w-4xl">{body}</p>
    </div>
);

export const NextLink: React.FC<{ href: string; label: string; sub?: string }> = ({ href, label, sub }) => (
    <Link href={href} className="group tile p-6 flex items-center justify-between gap-6 hover:border-brand-gold/60 transition-colors">
        <div>
            <p className="text-white font-bold">{label}</p>
            {sub && <p className="text-sm text-white/55 mt-1">{sub}</p>}
        </div>
        <ArrowRight className="w-5 h-5 text-brand-gold shrink-0 group-hover:translate-x-1 transition-transform" />
    </Link>
);

export const Section: React.FC<{ eyebrow?: string; title?: string; intro?: string; className?: string; children?: React.ReactNode; wide?: boolean }> = ({ eyebrow, title, intro, className, children }) => (
    <section className={cn("py-16 md:py-24", className)}>
        <div className="container-editorial">
            {(eyebrow || title || intro) && (
                <div className="max-w-3xl mb-10 md:mb-12">
                    {eyebrow && <p className="label-tech mb-4">{eyebrow}</p>}
                    {title && <h2 className="mb-4">{title}</h2>}
                    {intro && <p className="text-white/70">{intro}</p>}
                </div>
            )}
            {children}
        </div>
    </section>
);
