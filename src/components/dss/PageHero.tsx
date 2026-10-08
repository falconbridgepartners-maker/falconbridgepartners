import React from 'react';
import { acronymize } from '@/components/dss/acronymize';

interface Props {
    eyebrow?: string;
    title: string;
    titleAccent?: string; // closing words of the title set in gold (Professional Curiosity headlines)
    governing?: string;   // Georgia Italic line — the governing question or emphasis
    intro?: string;
    children?: React.ReactNode;
}

const PageHero: React.FC<Props> = ({ eyebrow, title, titleAccent, governing, intro, children }) => (
    <section className="relative pt-14 md:pt-20 pb-16 md:pb-20 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[28rem] bg-gradient-to-b from-brand-navy-dark to-brand-navy pointer-events-none" />
        <div className="container-editorial relative z-10">
            <div className="max-w-4xl">
                {eyebrow && <p className="label-tech mb-5">{eyebrow}</p>}
                <h1 className="mb-6">{title}{titleAccent ? <> <span className="text-brand-gold">{titleAccent}</span></> : null}</h1>
                {governing && <p className="governing text-2xl md:text-[2rem] leading-snug mb-8 max-w-3xl">{acronymize(governing)}</p>}
                {intro && <p className="text-white/75 text-lg md:text-xl max-w-3xl">{acronymize(intro)}</p>}
                {children}
            </div>
        </div>
    </section>
);

export default PageHero;
