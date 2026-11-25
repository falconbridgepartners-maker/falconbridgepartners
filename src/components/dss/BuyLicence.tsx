"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import TurnstileWidget from '@/components/ui/TurnstileWidget';
import { LICENCES, quote, type LicenceId, type Tier } from '@/lib/licencePricing';

type CountryOption = { code: string; name: string; high: boolean; currency: string | null; rate: number | null };
type Props = {
  slug: string;
  title: string;
  tier: Tier;
  countries: CountryOption[];
  defaultCountry: string;
  /** True when the country came from the visitor's location. */
  detected: boolean;
  summary: Record<LicenceId, { k: string; v: string }[]>;
  /** Card payment through Stripe Checkout is switched on. */
  card: boolean;
  testMode: boolean;
};

const inputClass = 'w-full rounded-lg bg-white/3 border border-brand-gold/25 px-3.5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-gold/70 transition-colors';
const labelClass = 'text-xs font-bold text-white/70 block';
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

/** Step 1 of research licence sales: the buyer chooses a licence and requests it; we invoice and deliver on payment. */
export default function BuyLicence({ slug, title, tier, countries, defaultCountry, detected, summary, card, testMode }: Props) {
  const [lic, setLic] = useState<LicenceId>('t2');
  const [country, setCountry] = useState(defaultCountry);
  const [form, setForm] = useState({ company: '', fullName: '', email: '', address: '', objective: '' });
  const [accepted, setAccepted] = useState(false);
  const [declared, setDeclared] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const c = countries.find((x) => x.code === country) ?? countries[0];
  const q = useMemo(() => quote(lic, tier, c.code), [lic, tier, c.code]);
  const licence = LICENCES.find((l) => l.id === lic)!;
  const local = c.currency && c.rate && c.currency !== 'USD' ? `≈ ${c.currency} ${fmt(q.total * c.rate)} total` : null;

  const change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const [mode, setMode] = useState<'card' | 'invoice'>(card ? 'card' : 'invoice');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!declared) { setError('Please confirm the country where the licensee is registered.'); return; }
    if (!accepted) { setError('Please tick to accept the terms first.'); return; }
    if (!token) { setError('Unable to verify the request. Please try again.'); return; }
    setBusy(true); setError(null);
    try {
      const res = await fetch(mode === 'card' ? '/api/licence-checkout' : '/api/licence-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, slug, licence: lic, country: c.code, accepted, declared, turnstileToken: token }),
      });
      if (res.ok && mode === 'card') {
        const d = await res.json();
        if (d?.url) { window.location.href = d.url; return; }
        setError('Card checkout could not be started. Please try again or request an invoice.');
      } else if (res.ok) setDone(true);
      else {
        let msg = `The request could not be sent (${res.status}).`;
        try { const d = await res.json(); if (d?.error) msg = d.error; } catch { /* ignore */ }
        setError(msg);
      }
    } catch { setError('The request could not be sent. Please try again.'); }
    finally { setBusy(false); }
  };

  if (done) {
    return (
      <div className="tile p-8 max-w-2xl" role="status">
        <h2 className="text-2xl mb-3">Thank you.</h2>
        <p className="text-white/70">Your request for a {licence.short} licence to <span className="text-white">{title}</span> is with us. Your invoice follows by email to {form.email}. The report is delivered as soon as payment is received.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-10">
        <fieldset>
          <legend className="label-tech mb-4">1. Choose your licence</legend>
          <div className="grid gap-3">
            {LICENCES.map((l) => (
              <label key={l.id} className={`rounded-2xl p-4 border cursor-pointer flex gap-3 ${lic === l.id ? 'border-brand-gold bg-brand-gold/10' : 'border-white/15 bg-white/[0.03] hover:border-white/30'}`}>
                <input type="radio" name="licence" value={l.id} checked={lic === l.id} onChange={() => setLic(l.id)} className="mt-1 accent-[#c8a86a]" />
                <span><span className="block text-white font-bold">{l.name}</span><span className="block text-sm text-white/65 mt-1">{l.desc}</span></span>
              </label>
            ))}
          </div>
          <p className="text-sm text-white/50 mt-3">Need exclusivity or public use? <Link href="/decision-support-system" className="text-brand-gold-pale underline underline-offset-4">Commission a study</Link>.</p>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="label-tech mb-4">2. Country of registration</legend>
          <label htmlFor="bl-country" className={labelClass}>Where your organisation is registered</label>
          <select id="bl-country" value={country} onChange={(e) => { setCountry(e.target.value); setDeclared(false); }} className={inputClass}>
            {countries.map((x) => <option key={x.code} value={x.code} className="bg-[#151C2F]">{x.name}</option>)}
          </select>
          <p className="text-sm text-white/50">
            Your country sets the price band and whether UAE VAT applies{detected ? '. We pre-selected it from your location; change it if your organisation is registered elsewhere' : ''}.
            Buyers registered in countries the World Bank does not class as high income pay 40% less.
          </p>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="label-tech mb-4">3. Your details for the invoice</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5"><label htmlFor="bl-company" className={labelClass}>Company name</label><input id="bl-company" name="company" value={form.company} onChange={change} required autoComplete="organization" className={inputClass} /></div>
            <div className="space-y-1.5"><label htmlFor="bl-name" className={labelClass}>Your name</label><input id="bl-name" name="fullName" value={form.fullName} onChange={change} required autoComplete="name" className={inputClass} /></div>
            <div className="space-y-1.5 md:col-span-2"><label htmlFor="bl-email" className={labelClass}>Email</label><input id="bl-email" type="email" name="email" value={form.email} onChange={change} required autoComplete="email" className={inputClass} /></div>
          </div>
          <div className="space-y-1.5"><label htmlFor="bl-address" className={labelClass}>Invoice address</label><textarea id="bl-address" name="address" value={form.address} onChange={change} required rows={3} autoComplete="street-address" className={`${inputClass} resize-none`} /></div>
          {lic === 't2' && (
            <div className="space-y-1.5">
              <label htmlFor="bl-objective" className={labelClass}>Stated objective (Single Use)</label>
              <textarea id="bl-objective" name="objective" value={form.objective} onChange={change} required rows={3} className={`${inputClass} resize-none`} placeholder="The one business purpose this report is licensed for" />
            </div>
          )}
        </fieldset>
      </div>

      <aside className="lg:col-span-5">
        <div className="tile p-6 md:p-7 space-y-5 lg:sticky lg:top-28">
          <p className="label-tech">Your order</p>
          <div>
            <p className="text-white font-bold">{licence.short} · {title}</p>
            <p className="text-sm text-white/55 mt-1">{c.name} · {q.reduced ? 'Reduced price (not high income)' : 'Standard price (high income)'}</p>
          </div>
          <dl className="text-sm space-y-2 border-t border-white/10 pt-4">
            <div className="flex justify-between gap-4"><dt className="text-white/65">Licence fee</dt><dd className="text-white">US${fmt(q.usd)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-white/65">{q.uae ? 'UAE VAT 5%' : 'VAT'}</dt><dd className="text-white text-right">{q.uae ? `US$${fmt(q.vat)}` : 'Not charged outside the UAE'}</dd></div>
            <div className="flex justify-between gap-4 border-t border-white/10 pt-3"><dt className="text-white font-bold">Total</dt><dd className="text-white font-bold text-lg">US${fmt(q.total)}</dd></div>
            {local && <div className="text-right text-white/60">{local}</div>}
          </dl>
          <p className="text-xs text-white/45">{local ? `The local amount is an estimate at today’s rate.${card ? ' Card checkout shows the exact amount in your currency, and you can pay in either.' : ' You are invoiced in US$.'}` : 'Charged in US$.'}</p>
          {q.reduced && <p className="text-sm text-brand-gold-pale">Reduced price: 40% below the standard US${fmt(q.usdStandard)}.</p>}

          <div className="border-t border-white/10 pt-4">
            <p className="text-sm text-white font-semibold mb-1">Summary of licence terms: {licence.short}</p>
            <p className="text-xs text-white/45 mb-3">Summary only. The full Research Licences terms apply and prevail.</p>
            <dl className="space-y-1.5 text-xs max-h-72 overflow-y-auto pr-1">
              {summary[lic].map((r) => <div key={r.k} className="grid grid-cols-[1fr_auto] gap-3"><dt className="text-white/60">{r.k}</dt><dd className="text-white text-right">{r.v}</dd></div>)}
            </dl>
            <p className="text-sm mt-3">Read the full terms: <Link href="/legal/research-licences" target="_blank" className="text-brand-gold-pale underline underline-offset-4">Research Licences (v1.0)</Link>.</p>
          </div>

          <label className="flex items-start gap-3 text-sm text-white/75">
            <input type="checkbox" checked={declared} onChange={(e) => { setDeclared(e.target.checked); setError(null); }} className="mt-1 accent-[#c8a86a]" />
            <span>I confirm the licensee organisation is registered in <span className="text-white">{c.name}</span>. The price and VAT are set by this country, and we may ask for proof of registration before delivery.</span>
          </label>
          <label className="flex items-start gap-3 text-sm text-white/75">
            <input type="checkbox" checked={accepted} onChange={(e) => { setAccepted(e.target.checked); setError(null); }} className="mt-1 accent-[#c8a86a]" />
            <span>I have read and accept the FalconBridge Research Licences (v1.0), including the Common Terms, for this licence.</span>
          </label>
          <TurnstileWidget onTokenChange={setToken} />
          {error && <p className="text-red-200 text-sm bg-red-900/20 border border-red-500/30 rounded-lg p-3" role="alert">{error}</p>}
          {card && (
            <fieldset className="space-y-2">
              <legend className="sr-only">How you want to pay</legend>
              <label className="flex items-start gap-3 text-sm text-white/80"><input type="radio" name="pay" checked={mode === 'card'} onChange={() => setMode('card')} className="mt-1 accent-[#c8a86a]" /><span>Pay now by card (secure checkout by Stripe)</span></label>
              <label className="flex items-start gap-3 text-sm text-white/80"><input type="radio" name="pay" checked={mode === 'invoice'} onChange={() => setMode('invoice')} className="mt-1 accent-[#c8a86a]" /><span>Request an invoice: pay by bank transfer, or online by card within 14 days</span></label>
            </fieldset>
          )}
          <Button type="submit" variant="primary" size="md" icon={ArrowRight} disabled={busy}>{busy ? 'Sending…' : mode === 'card' ? `Pay US$${fmt(q.total)} by card` : 'Request licence and invoice'}</Button>
          <p className="text-xs text-white/45">{mode === 'card' ? 'The report is delivered with its licence statement once payment is complete.' : 'We invoice and deliver on payment.'}</p>
          {testMode && <p className="text-xs text-amber-300">Test mode: no real card is charged.</p>}
        </div>
      </aside>
    </form>
  );
}
