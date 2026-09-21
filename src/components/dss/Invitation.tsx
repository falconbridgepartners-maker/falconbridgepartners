import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import falconMark from '@/assets/images/falcon-mark.png';
import { firm } from '@/content/site';

/** Closing block on every page — the approved invitation (Foundation v1.1, deck slide 16). */
const Invitation: React.FC<{ compact?: boolean }> = ({ compact }) => (
    <section className={compact ? "py-16" : "section-padding"}>
        <div className="container-editorial">
            <div className="tile p-10 md:p-16 border-brand-gold/40 overflow-hidden relative">
                <div className="absolute right-6 bottom-[-2rem] w-56 pointer-events-none select-none hidden md:block" aria-hidden="true">
                    <Image src={falconMark} alt="" className="w-full h-auto opacity-[0.08]" />
                </div>
                <p className="label-tech mb-6">A conversation about your decision</p>
                <h2 className="mb-2">What needs to be understood</h2>
                <p className="governing text-3xl md:text-[2.6rem] leading-tight mb-8">before your next decision?</p>
                <p className="text-white/75 max-w-2xl mb-10">{firm.invitation.body}</p>
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                    <Button href="/contact" variant="primary" size="md" icon={ArrowRight}>{firm.invitation.cta}</Button>
                    <span className="text-sm text-white/45">falconbp.com</span>
                </div>
            </div>
        </div>
    </section>
);

export default Invitation;
