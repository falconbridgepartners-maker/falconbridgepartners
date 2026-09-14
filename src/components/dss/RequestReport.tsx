"use client";

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import TurnstileWidget from '@/components/ui/TurnstileWidget';

const inputClass = "w-full rounded-lg bg-white/3 border border-brand-gold/25 px-3.5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-gold/70 transition-colors";
const labelClass = "text-xs font-bold text-white/70 block";

/** Request the full research package for a public study — routes to /api/submit-research (existing). */
const RequestReport: React.FC<{ studyTitle: string }> = ({ studyTitle }) => {
    const [open, setOpen] = useState(false);
    const [done, setDone] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [form, setForm] = useState({ fullName: '', email: '', organization: '', role: '', decisionContext: '' });

    const change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true); setError(null);
        try {
            if (!token) { setError('Unable to verify request. Please try again.'); setBusy(false); return; }
            const res = await fetch('/api/submit-research', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, decisionContext: `[${studyTitle}] ${form.decisionContext}`.trim(), turnstileToken: token }),
            });
            if (res.ok) setDone(true);
            else {
                let msg = `The request could not be sent (${res.status}).`;
                try { const d = await res.json(); if (d?.error) msg = d.error; } catch { /* ignore */ }
                setError(msg);
            }
        } catch { setError('The request could not be sent. Please try again.'); }
        finally { setBusy(false); }
    };

    if (!open) {
        return (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Button variant="primary" size="md" icon={ArrowRight} onClick={() => setOpen(true)}>Request the full report</Button>
                <p className="text-sm text-white/50">The package is released under a Type-1 licence for the requester’s own use. Public access does not transfer ownership.</p>
            </div>
        );
    }
    if (done) {
        return (
            <div className="border border-brand-gold/30 rounded-xl p-6">
                <h3 className="text-xl mb-2">Received.</h3>
                <p className="text-sm text-white/70">A partner will reply with the package and its licence terms.</p>
            </div>
        );
    }
    return (
        <form onSubmit={submit} className="tile p-6 md:p-8 space-y-4">
            <p className="label-tech">Request the full report</p>
            {error && <p className="text-red-200 text-sm bg-red-900/20 border border-red-500/30 rounded-lg p-3">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5"><label htmlFor="rr-name" className={labelClass}>Full name</label><input id="rr-name" name="fullName" value={form.fullName} onChange={change} required className={inputClass} /></div>
                <div className="space-y-1.5"><label htmlFor="rr-email" className={labelClass}>Work email</label><input id="rr-email" type="email" name="email" value={form.email} onChange={change} required className={inputClass} /></div>
                <div className="space-y-1.5"><label htmlFor="rr-org" className={labelClass}>Organisation</label><input id="rr-org" name="organization" value={form.organization} onChange={change} required className={inputClass} /></div>
                <div className="space-y-1.5"><label htmlFor="rr-role" className={labelClass}>Role</label><input id="rr-role" name="role" value={form.role} onChange={change} required className={inputClass} /></div>
            </div>
            <div className="space-y-1.5"><label htmlFor="rr-ctx" className={labelClass}>Intended use (optional)</label><textarea id="rr-ctx" name="decisionContext" value={form.decisionContext} onChange={change} rows={3} className={`${inputClass} resize-none`} placeholder="Internal reading, adviser use, a decision in view…" /></div>
            <TurnstileWidget onTokenChange={setToken} />
            <div className="flex items-center gap-4 pt-2 border-t border-brand-gold/15">
                <Button type="submit" variant="primary" size="sm" icon={ArrowRight} disabled={busy}>{busy ? 'Sending…' : 'Send request'}</Button>
                <button type="button" onClick={() => setOpen(false)} className="text-sm text-white/50 hover:text-white">Cancel</button>
            </div>
        </form>
    );
};

export default RequestReport;
