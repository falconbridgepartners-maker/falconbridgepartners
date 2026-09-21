'use client';
export default function LoginError({ error }: { error: Error }) {
  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center px-6">
      <div className="tile p-8 max-w-md">
        <p className="label-tech mb-2">Research admin</p>
        <h1 className="text-2xl mb-3">Sign-in is not available yet</h1>
        <p className="text-white/60 text-sm">{error.message}</p>
        <p className="text-white/40 text-xs mt-4">Set the Supabase environment variables in Vercel for this environment and redeploy.</p>
      </div>
    </div>
  );
}
