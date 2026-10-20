"use client";

import React, { useState } from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import TurnstileWidget from '@/components/ui/TurnstileWidget';

const inputClass = "w-full rounded-lg bg-white/3 border border-brand-gold/25 px-3.5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-gold/70 transition-colors";
const labelClass = "text-xs font-bold text-white/70 block";

/** "Email this piece": anyone gives a name and an email address and the piece is sent there. Posts to /api/share-piece. */
export default function EmailPiece({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [round, setRound] = useState(0); // a fresh bot check for each send

  const change = (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!token) { setError('Unable to verify the request. Please try again.'); return; }
    setBusy(true); setError(null);
    try {
      const res = await fetch('/api/share-piece', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, ...form, turnstileToken: token }),
      });
      if (res.ok) { setSentTo(form.email); setForm({ name: '', email: '' }); }
      else {
        let msg = `The piece could not be sent (${res.status}).`;
        try { const d = await res.json(); if (d?.error) msg = d.error; } catch { /* ignore */ }
        setError(msg);
      }
    } catch { setError('The piece could not be sent. Please try again.'); }
    finally { setBusy(false); setToken(null); setRound((r) => r + 1); }
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 text-sm text-brand-gold-pale hover:text-white underline underline-offset-4">
        <Mail className="w-4 h-4" /> Email this piece
      </button>
    );
  }
  return (
    <form onSubmit={submit} className="tile p-6 md:p-8 space-y-4 max-w-2xl">
      <p className="label-tech">Email this piece</p>
      <p className="text-sm text-white/60">Give the name and email address of the person you want to send it to. They receive the headline, a short summary and the link, nothing else.</p>
      {sentTo && <p className="text-sm text-white/80 border border-brand-gold/30 rounded-lg p-3" role="status">Sent to {sentTo}. You can send it to someone else below.</p>}
      {error && <p className="text-red-200 text-sm bg-red-900/20 border border-red-500/30 rounded-lg p-3" role="alert">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5"><label htmlFor="ep-name" className={labelClass}>Their name</label><input id="ep-name" name="name" value={form.name} onChange={change} required maxLength={80} className={inputClass} /></div>
        <div className="space-y-1.5"><label htmlFor="ep-email" className={labelClass}>Their email address</label><input id="ep-email" type="email" name="email" value={form.email} onChange={change} required maxLength={200} className={inputClass} /></div>
      </div>
      <TurnstileWidget key={round} onTokenChange={setToken} />
      <div className="flex items-center gap-4 pt-2 border-t border-brand-gold/15">
        <Button type="submit" variant="primary" size="sm" icon={ArrowRight} disabled={busy}>{busy ? 'Sending…' : 'Send'}</Button>
        <button type="button" onClick={() => { setOpen(false); setSentTo(null); setError(null); }} className="text-sm text-white/50 hover:text-white">Close</button>
      </div>
    </form>
  );
}
