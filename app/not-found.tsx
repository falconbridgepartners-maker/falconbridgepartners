import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
    return (
        <section className="min-h-screen bg-brand-navy flex items-center justify-center px-6">
            <div className="max-w-2xl text-center">
                <span className="label-tech mb-6 inline-block">NOT FOUND</span>
                <h1 className="mb-6">This page is not available.</h1>
                <p className="text-white/60 text-lg md:text-xl font-light leading-relaxed mb-10">
                    The page you are looking for does not exist or has been moved. If you are making a decision
                    and need clarity, start with the core pages below.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button href="/" variant="primary" size="md" icon={ArrowRight}>
                        Return home
                    </Button>
                    <Link
                        href="/contact"
                        className="text-[0.7rem] font-technical uppercase tracking-[0.2em] text-brand-gold/70 hover:text-brand-gold transition-colors"
                    >
                        Start a conversation
                    </Link>
                </div>
            </div>
        </section>
    );
}
