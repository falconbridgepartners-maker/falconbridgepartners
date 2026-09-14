import React from 'react';
import Image from 'next/image';
import { Linkedin, Mail } from 'lucide-react';
import joelImage from '@/assets/images/joel-arcus.png';
import quincyImage from '@/assets/images/quincy-beukes.png';
import type { Partner } from '@/content/site';

const images = { joel: joelImage, quincy: quincyImage } as const;

export const Portrait: React.FC<{ partner: Partner; className?: string }> = ({ partner, className }) => (
    <div className={`relative aspect-[4/5] overflow-hidden rounded-xl bg-brand-navy-dark border border-brand-gold/30 ${className ?? ''}`}>
        {partner.image ? (
            <Image src={images[partner.image]} alt={partner.name} className="w-full h-full object-cover object-top" />
        ) : (
            // Placeholder until the supplied portrait arrives — prototype only
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <div className="w-24 h-24 rounded-full border border-brand-gold/50 flex items-center justify-center">
                    <span className="font-technical text-3xl font-bold text-brand-gold-pale">{partner.initials}</span>
                </div>
                <span className="text-[0.68rem] text-white/40">Portrait to follow</span>
            </div>
        )}
    </div>
);

const PartnerCard: React.FC<{ partner: Partner; full?: boolean }> = ({ partner, full }) => (
    <article className="tile p-6 md:p-7 flex flex-col">
        <div className="flex gap-5 items-start">
            <Portrait partner={partner} className="w-24 md:w-28 shrink-0" />
            <div className="min-w-0">
                <h3 className="text-lg md:text-xl leading-tight">{partner.name}</h3>
                <p className="text-brand-gold-pale text-sm mt-1">{partner.title}</p>
                <p className="text-white/50 text-sm">{partner.location}</p>
            </div>
        </div>
        <p className="text-white/75 mt-5 text-[0.95rem]">{partner.emphasis}</p>
        {full && (
            <div className="mt-6 space-y-5">
                {partner.sections.map((s) => (
                    <div key={s.title}>
                        <h4 className="text-white font-bold text-sm mb-1.5">{s.title}</h4>
                        <p className="text-white/65 text-[0.92rem]">{s.body}</p>
                    </div>
                ))}
            </div>
        )}
        <div className="flex gap-3 mt-6 pt-5 border-t border-brand-gold/15">
            {partner.linkedin && (
                <a href={partner.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${partner.name} on LinkedIn`} className="p-2.5 border border-brand-gold/30 rounded-full text-white/80 hover:bg-brand-gold hover:text-brand-navy transition-colors">
                    <Linkedin className="w-4 h-4" />
                </a>
            )}
            <a href={`mailto:${partner.email}`} aria-label={`Email ${partner.name}`} className="p-2.5 border border-brand-gold/30 rounded-full text-white/80 hover:bg-brand-gold hover:text-brand-navy transition-colors">
                <Mail className="w-4 h-4" />
            </a>
            <span className="self-center text-sm text-white/45">{partner.email}</span>
        </div>
    </article>
);

export default PartnerCard;
