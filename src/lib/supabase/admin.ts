import 'server-only';
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';
import { staticGenerationAsyncStorage } from 'next/dist/client/components/static-generation-async-storage.external';

let cached: SupabaseClient | null = null;

/** Service-role client. SERVER ONLY. Bypasses RLS; used for admin_users lookup, writes and uploads. */
export function createAdminClient(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
  cached = createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    // Admin reads must never be served from Next's Data Cache (it persists across deployments on Vercel).
    // Inside an unstable_cache callback (the public reads in lib/data.ts) Next already forces every fetch past the
    // Data Cache, and an explicit cache: 'no-store' there makes the background refresh of a static page throw
    // "Dynamic server usage: no-store fetch", so the page kept serving stale data. There we leave cache unset.
    global: {
      fetch: (input, init) =>
        staticGenerationAsyncStorage.getStore()?.isUnstableCacheCallback ? fetch(input, init) : fetch(input, { ...init, cache: 'no-store' }),
    },
  });
  return cached;
}

export const supabaseConfigured = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
