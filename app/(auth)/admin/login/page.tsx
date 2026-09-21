import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import logo from '@/assets/logos/logo.png';
import { getAdminUser } from '@/lib/admin/auth';
import LoginForm from '@/components/admin/LoginForm';

export const metadata: Metadata = { title: 'Admin sign-in — FalconBridge Partners', robots: { index: false } };
export const dynamic = 'force-dynamic';

const WHY: Record<string, string> = {
  'no-session': 'The sign-in link was opened, but no session reached the site. Open the link in the same browser that requested it.',
  'not-admin': 'You are signed in, but this address is not in the admin list.',
  error: 'The admin check failed on the server.',
};

export default async function LoginPage({ searchParams }: { searchParams?: { error?: string; sent?: string; why?: string; as?: string } }) {
  if (await getAdminUser()) redirect('/admin');
  // Only render copy we own. An unrecognised `why` shows nothing, so the URL cannot
  // put attacker-chosen text into an official-looking error box on our own domain.
  const why = searchParams?.why && searchParams.why !== 'ok' ? WHY[searchParams.why] : undefined;
  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center px-6">
      <div className="tile p-8 md:p-10 w-full max-w-md">
        <Image src={logo} alt="FalconBridge Partners" className="h-12 w-auto mb-8" />
        <p className="label-tech mb-2">Research admin</p>
        <h1 className="text-2xl md:text-3xl mb-2">Sign in</h1>
        <p className="text-white/60 text-sm mb-6">Enter the admin address. A one-time sign-in link is sent to that inbox.</p>
        {searchParams?.error && <p className="text-red-200 text-sm bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-4">That link has expired or already been used. Request a new one.</p>}
        {why && (
          <p className="text-red-200 text-sm bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-4">
            {why}
            {searchParams?.as && <span className="block text-white/60 mt-1">Signed in as {searchParams.as}</span>}
          </p>
        )}
        {searchParams?.sent ? (
          <p className="text-brand-gold-pale text-sm">Link sent. Open it from the same browser to sign in.</p>
        ) : (
          <LoginForm />
        )}
      </div>
    </div>
  );
}
