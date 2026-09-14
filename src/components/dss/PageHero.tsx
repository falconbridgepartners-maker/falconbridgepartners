import React from 'react';

interface Props {
    eyebrow?: string;
    title: string;
    governing?: string;   // Georgia Italic line — the governing question or emphasis
    intro?: string;
    children?: React.ReactNode;
}

const PageHero: React.FC<Props> = ({ eyebrow, title, governing, intro, children }) => (
    <section className="relative pt-40 md:pt-48 pb-16 md:pb-20 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[28rem] bg-gradient-to-b from-brand-navy-dark to-brand-navy pointer-events-none" />
        <div className="container-editorial relative z-10">
            <div className="max-w-4xl">
                {eyebrow && <p className="label-tech mb-5">{eyebrow}</p>}
                <h1 className="mb-6">{title}</h1>
                {governing && <p className="governing text-2xl md:text-[2rem] leading-snug mb-8 max-w-3xl">{governing}</p>}
                {intro && <p className="text-white/75 text-lg md:text-xl max-w-3xl">{intro}</p>}
                {children}
            </div>
        </div>
    </section>
);

export default PageHero;
