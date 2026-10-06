import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Read-only Dropbox access for the weekly importer.
 *
 * The app key and secret live in the environment (DROPBOX_APP_KEY / DROPBOX_APP_SECRET).
 * The refresh token is obtained once through /api/dropbox/connect and kept in public.app_secrets,
 * which only the service-role client can read. Nothing here writes to Dropbox.
 */

const API = 'https://api.dropboxapi.com';
const CONTENT = 'https://content.dropboxapi.com';
const SECRET_KEY = 'dropbox_refresh_token';

export const DEFAULT_PUBLISH_PATH = '/FalconBridge Workspace [Shared - All]/W. Website Publishing';
export const publishPath = () => (process.env.DROPBOX_PUBLISH_PATH || DEFAULT_PUBLISH_PATH).replace(/\/+$/, '');

export const dropboxConfigured = () => Boolean(process.env.DROPBOX_APP_KEY && process.env.DROPBOX_APP_SECRET);

export class DropboxError extends Error {
  constructor(message: string, public code: 'not-configured' | 'not-connected' | 'auth' | 'not-found' | 'api' = 'api') { super(message); }
}

export type DropboxConnection = { connected: boolean; account?: string; connectedAt?: string; connectedBy?: string };
export type DropboxEntry = { tag: 'file' | 'folder'; id: string; name: string; path: string; size?: number; rev?: string; modified?: string };

const basicAuth = () => `Basic ${Buffer.from(`${process.env.DROPBOX_APP_KEY}:${process.env.DROPBOX_APP_SECRET}`).toString('base64')}`;

/** JSON for the Dropbox-API-Arg header: HTTP headers must be ASCII, so everything else is \u-escaped. */
const headerJson = (v: unknown) => JSON.stringify(v).replace(/[\u007f-\uffff]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`);

// ── Connection (OAuth, offline access) ───────────────────────────────────────
export function authorizeUrl(redirectUri: string, state: string): string {
  if (!dropboxConfigured()) throw new DropboxError('Dropbox app key and secret are not set.', 'not-configured');
  const p = new URLSearchParams({
    client_id: process.env.DROPBOX_APP_KEY!, response_type: 'code', token_access_type: 'offline', redirect_uri: redirectUri, state,
  });
  return `https://www.dropbox.com/oauth2/authorize?${p.toString()}`;
}

/** Exchanges the code from the redirect for a refresh token and stores it. */
export async function completeConnection(code: string, redirectUri: string, connectedBy: string): Promise<void> {
  if (!dropboxConfigured()) throw new DropboxError('Dropbox app key and secret are not set.', 'not-configured');
  const res = await fetch(`${API}/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: basicAuth(), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, grant_type: 'authorization_code', redirect_uri: redirectUri }).toString(),
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.refresh_token) throw new DropboxError(`Dropbox did not issue a refresh token (${data.error_description || data.error || res.status}).`, 'auth');
  tokenCache = { token: data.access_token, exp: Date.now() + (Number(data.expires_in) || 14400) * 1000 };
  rootCache = null;
  let account = '';
  try { account = (await currentAccount()).email; } catch { /* the connection is still valid */ }
  const db = createAdminClient();
  const { error } = await db.from('app_secrets').upsert({
    key: SECRET_KEY, value: data.refresh_token, updated_at: new Date().toISOString(),
    meta: { account, connected_by: connectedBy, connected_at: new Date().toISOString() },
  });
  if (error) throw new DropboxError(`Could not store the Dropbox connection: ${error.message}`);
}

export async function connectionStatus(): Promise<DropboxConnection> {
  try {
    const db = createAdminClient();
    const { data } = await db.from('app_secrets').select('meta').eq('key', SECRET_KEY).maybeSingle();
    if (!data) return { connected: false };
    const m = (data.meta ?? {}) as Record<string, string>;
    return { connected: true, account: m.account, connectedAt: m.connected_at, connectedBy: m.connected_by };
  } catch { return { connected: false }; }
}

export async function disconnect(): Promise<void> {
  const db = createAdminClient();
  const { data } = await db.from('app_secrets').select('value').eq('key', SECRET_KEY).maybeSingle();
  if (data?.value) {
    try { const t = await accessToken(); await fetch(`${API}/2/auth/token/revoke`, { method: 'POST', headers: { Authorization: `Bearer ${t}` }, cache: 'no-store' }); } catch { /* best effort */ }
  }
  await db.from('app_secrets').delete().eq('key', SECRET_KEY);
  tokenCache = null; rootCache = null;
}

// ── Tokens ───────────────────────────────────────────────────────────────────
let tokenCache: { token: string; exp: number } | null = null;
let rootCache: string | null = null;

async function accessToken(): Promise<string> {
  if (tokenCache && tokenCache.exp - 60_000 > Date.now()) return tokenCache.token;
  if (!dropboxConfigured()) throw new DropboxError('Dropbox app key and secret are not set.', 'not-configured');
  const db = createAdminClient();
  const { data } = await db.from('app_secrets').select('value').eq('key', SECRET_KEY).maybeSingle();
  if (!data?.value) throw new DropboxError('Dropbox is not connected yet.', 'not-connected');
  const res = await fetch(`${API}/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: basicAuth(), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: data.value }).toString(),
    cache: 'no-store',
  });
  const tok = await res.json().catch(() => ({}));
  if (!res.ok || !tok.access_token) throw new DropboxError(`Dropbox refused the stored connection (${tok.error_description || tok.error || res.status}). Reconnect Dropbox.`, 'auth');
  tokenCache = { token: tok.access_token, exp: Date.now() + (Number(tok.expires_in) || 14400) * 1000 };
  return tokenCache.token;
}

async function currentAccount(): Promise<{ email: string; root: string }> {
  const token = await accessToken();
  const res = await fetch(`${API}/2/users/get_current_account`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new DropboxError(`Dropbox account lookup failed (${res.status}).`, 'auth');
  return { email: data.email ?? '', root: data.root_info?.root_namespace_id ?? '' };
}

/** Team spaces sit outside a member's home folder; every call is rooted at the account's root namespace so shared team folders resolve. */
async function pathRootHeader(): Promise<Record<string, string>> {
  if (rootCache === null) rootCache = (await currentAccount()).root;
  return rootCache ? { 'Dropbox-API-Path-Root': headerJson({ '.tag': 'root', root: rootCache }) } : {};
}

const describe = (data: unknown, status: number) => {
  const d = data as { error_summary?: string } | string | null;
  return typeof d === 'string' ? d.slice(0, 200) : d?.error_summary ?? `HTTP ${status}`;
};

async function rpc<T>(endpoint: string, body: unknown): Promise<T> {
  const token = await accessToken();
  const res = await fetch(`${API}/2/${endpoint}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(await pathRootHeader()) },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const text = await res.text();
  let data: unknown = text;
  try { data = JSON.parse(text); } catch { /* plain-text error */ }
  if (!res.ok) {
    const summary = describe(data, res.status);
    throw new DropboxError(`Dropbox: ${summary}`, /not_found/.test(summary) ? 'not-found' : res.status === 401 ? 'auth' : 'api');
  }
  return data as T;
}

type RawEntry = { '.tag': string; id: string; name: string; path_display?: string; path_lower?: string; size?: number; rev?: string; server_modified?: string };
const toEntry = (e: RawEntry): DropboxEntry | null =>
  e['.tag'] === 'file' || e['.tag'] === 'folder'
    ? { tag: e['.tag'], id: e.id, name: e.name, path: e.path_display ?? e.path_lower ?? '', size: e.size, rev: e.rev, modified: e.server_modified }
    : null;

/** Lists a folder (all pages). `path` may be a display path or an `id:` reference. */
export async function listFolder(path: string, recursive = false): Promise<DropboxEntry[]> {
  const out: DropboxEntry[] = [];
  type Page = { entries: RawEntry[]; cursor: string; has_more: boolean };
  let page = await rpc<Page>('files/list_folder', { path, recursive, limit: 1000 });
  for (;;) {
    for (const e of page.entries) { const x = toEntry(e); if (x) out.push(x); }
    if (!page.has_more) break;
    page = await rpc<Page>('files/list_folder/continue', { cursor: page.cursor });
  }
  return out;
}

export async function metadata(path: string): Promise<DropboxEntry> {
  const e = toEntry(await rpc<RawEntry>('files/get_metadata', { path }));
  if (!e) throw new DropboxError(`Dropbox: nothing usable at ${path}`, 'not-found');
  return e;
}

/** Downloads one file. `path` may be a display path or an `id:` reference. */
export async function download(path: string): Promise<{ data: ArrayBuffer; entry: DropboxEntry }> {
  const token = await accessToken();
  const res = await fetch(`${CONTENT}/2/files/download`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Dropbox-API-Arg': headerJson({ path }), ...(await pathRootHeader()) },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    let data: unknown = text;
    try { data = JSON.parse(text); } catch { /* plain-text error */ }
    const summary = describe(data, res.status);
    throw new DropboxError(`Dropbox: ${summary} (${path})`, /not_found/.test(summary) ? 'not-found' : 'api');
  }
  let raw: RawEntry = { '.tag': 'file', id: path, name: path.split('/').pop() ?? path };
  try { raw = { '.tag': 'file', ...JSON.parse(res.headers.get('dropbox-api-result') ?? '{}') }; } catch { /* metadata header is optional */ }
  return { data: await res.arrayBuffer(), entry: toEntry(raw)! };
}

export async function downloadText(path: string): Promise<{ text: string; entry: DropboxEntry }> {
  const { data, entry } = await download(path);
  return { text: new TextDecoder('utf-8').decode(data), entry };
}
