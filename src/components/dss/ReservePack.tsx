"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import TurnstileWidget from '@/components/ui/TurnstileWidget';

const inputClass = "w-full rounded-lg bg-white/3 border border-brand-gold/25 px-3.5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-gold/70 transition-colors";
const labelClass = "text-xs font-bold text-white/70 block";

type Props = { slug: string; place: string; weekText: string };

/** On a week placeholder: name and email now, the pack by email the moment it lands. Posts to /api/reserve-pack. */
const ReservePack: React.FC<Props> = ({ slug, place, weekText }) => {
    const [open, setOpen] = useState(false);
    const [done, setDone] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [consent, setConsent] = useState(false);
    const [form, setForm] = useState({ fullName: '', email: '', organization: '' });

    useEffect(() => {
        const openFromLink = () => { if (window.location.hash === '#research-pack') setOpen(true); };
        openFromLink();
        window.addEventListener('hashchange', openFromLink);
        return () => window.removeEventListener('hashchange', openFromLink);
    }, []);

    const change = (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true); setError(null);
        try {
            if (!token) { setError('Unable to verify request. Please try again.'); setBusy(false); return; }
            const res = await fetch('/api/reserve-pack', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, slug, consent, turnstileToken: token }) });
            if (res.ok) setDone(true);
            else {
                let msg = `The reservation could not be sent (${res.status}).`;
                try { const d = await res.json(); if (d?.error) msg = d.error; } catch { /* ignore */ }
                setError(msg);
            }
        } catch { setError('The reservation could not be sent. Please try again.'); }
        finally { setBusy(false); }
    };

    if (done) {
        return (
            <div className="border border-brand-gold/30 rounded-xl p-6" role="status">
                <h3 className="text-xl mb-2">Reserved.</h3>
                <p className="text-sm text-white/70">A note is on its way to {form.email}. The pack follows by email the moment the {place} study for {weekText} is published.</p>
            </div>
        );
    }
    if (!open) {
        return (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Button variant="primary" size="md" icon={ArrowRight} onClick={() => setOpen(true)}>Send me the pack when it lands</Button>
                <p className="text-sm text-white/50">Name and email now; the full pack by email as soon as the study is published. Nothing else is sent.</p>
            </div>
        );
    }
    return (
        <form onSubmit={submit} className="tile p-6 md:p-8 space-y-4">
            <p className="label-tech">Reserve the research pack</p>
            <p className="text-sm text-white/60">You will be emailed the full pack for {place}, {weekText}, when it lands: the guide, the executive deck, the full report, the summary, the visual and the reference audit.</p>
            {error && <p className="text-red-200 text-sm bg-red-900/20 border border-red-500/30 rounded-lg p-3" role="alert">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5"><label htmlFor="rp-name" className={labelClass}>Full name</label><input id="rp-name" name="fullName" value={form.fullName} onChange={change} required autoComplete="name" className={inputClass} /></div>
                <div className="space-y-1.5"><label htmlFor="rp-email" className={labelClass}>Work email</label><input id="rp-email" type="email" name="email" value={form.email} onChange={change} required autoComplete="email" className={inputClass} /></div>
                <div className="space-y-1.5 md:col-span-2"><label htmlFor="rp-org" className={labelClass}>Organisation (optional)</label><input id="rp-org" name="organization" value={form.organization} onChange={change} autoComplete="organization" className={inputClass} /></div>
            </div>
            <label className="flex items-start gap-3 text-sm text-white/70">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required className="mt-1 accent-[#c8a86a]" />
                <span>FalconBridge Partners may contact me about this study. My details are handled as set out in the <Link href="/privacy-policy" className="text-brand-gold-pale underline underline-offset-4">privacy policy</Link>.</span>
            </label>
            <TurnstileWidget onTokenChange={setToken} />
            <div className="flex items-center gap-4 pt-2 border-t border-brand-gold/15">
                <Button type="submit" variant="primary" size="sm" icon={ArrowRight} disabled={busy}>{busy ? 'Sending…' : 'Reserve the pack'}</Button>
                <button type="button" onClick={() => setOpen(false)} className="text-sm text-white/50 hover:text-white">Cancel</button>
            </div>
        </form>
    );
};

export default ReservePack;
