'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const input = "w-full rounded-lg bg-white/3 border border-brand-gold/25 px-3.5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-gold/70";

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin`, shouldCreateUser: true },
    });
    setBusy(false);
    if (error) { setError(error.message); return; }
    router.replace('/admin/login?sent=1');
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <p className="text-red-200 text-sm">{error}</p>}
      <label htmlFor="email" className="text-xs font-bold text-white/70 block">Email</label>
      <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={input} placeholder="researchteam@falconbp.com" />
      <button type="submit" disabled={busy} className="w-full rounded-full bg-brand-gold text-brand-navy font-bold text-sm py-3 hover:bg-brand-gold-pale transition-colors disabled:opacity-60">
        {busy ? 'Sending…' : 'Send sign-in link'}
      </button>
    </form>
  );
}
