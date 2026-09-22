'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'node:crypto';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/admin/auth';
import { PUBLIC_MEDIA, RESEARCH_FILES } from '@/lib/data';

export async function signOut() {
  try { const supabase = createClient(); await supabase.auth.signOut(); } catch { /* no session under preview bypass */ }
  revalidateAdmin();
  redirect('/admin/login');
}

const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 80);
const str = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();
const bool = (fd: FormData, k: string) => fd.get(k) === 'on' || fd.get(k) === 'true';

/** Purge the admin tree from Next's client Router Cache so edit pages reload fresh rows after a save/delete. */
function revalidateAdmin() { revalidatePath('/admin', 'layout'); }

function revalidateResearch() {
  for (const p of ['/', '/research', '/research/library', '/research/weekly-scan', '/sitemap.xml']) revalidatePath(p);
}

// ── Reports ──────────────────────────────────────────────────────────────────
export async function saveReport(fd: FormData) {
  await requireAdmin();
  const db = createAdminClient();
  const id = str(fd, 'id') || null;
  const title = str(fd, 'title');
  if (!title) throw new Error('Title is required');
  const facts: { figure: string; body: string }[] = [];
  for (let i = 0; i < 3; i++) {
    const figure = str(fd, `fact_figure_${i}`), body = str(fd, `fact_body_${i}`);
    if (figure || body) facts.push({ figure, body });
  }
  const row = {
    slug: str(fd, 'slug') ? slugify(str(fd, 'slug')) : slugify(title),
    title,
    subtitle: str(fd, 'subtitle') || null,
    kind: str(fd, 'kind') || 'study',
    territory: str(fd, 'territory') || 'south-africa',
    year: str(fd, 'year') ? Number(str(fd, 'year')) : null,
    published_at: str(fd, 'published_at') || null,
    cover_path: str(fd, 'cover_path') || null,
    extract_path: str(fd, 'extract_path') || null,
    extract_note: str(fd, 'extract_note') || null,
    qualifier: str(fd, 'qualifier') || null,
    body: str(fd, 'body') || null,
    facts,
    featured: bool(fd, 'featured'),
    published: bool(fd, 'published'),
  };
  let reportId = id;
  if (id) {
    const { error } = await db.from('reports').update(row).eq('id', id);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await db.from('reports').insert(row).select('id').single();
    if (error) throw new Error(error.message);
    reportId = data.id;
  }
  // Package files: six fixed slots; each carries label, storage_path, access.
  const labels = ['User guide', 'Executive deck', 'Full research report', 'Executive summary', 'Executive visual', 'Reference and link audit'];
  for (let i = 0; i < labels.length; i++) {
    const fileId = str(fd, `file_id_${i}`);
    const payload = {
      report_id: reportId!, label: str(fd, `file_label_${i}`) || labels[i], sort_order: i + 1,
      storage_path: str(fd, `file_path_${i}`) || null, access: str(fd, `file_access_${i}`) === 'open' ? 'open' : 'request',
      size_bytes: str(fd, `file_size_${i}`) ? Number(str(fd, `file_size_${i}`)) : null,
    };
    if (fileId) await db.from('report_files').update(payload).eq('id', fileId);
    else await db.from('report_files').insert(payload);
  }
  if (row.featured) await db.from('site_settings').update({ featured_report_id: reportId }).eq('id', 1);
  revalidateResearch();
  revalidatePath(`/research/studies/${row.slug}`);
  revalidateAdmin();
  redirect('/admin/reports?saved=1');
}

export async function deleteReport(fd: FormData) {
  await requireAdmin();
  const id = str(fd, 'id');
  if (!id) return;
  const db = createAdminClient();
  await db.from('reports').delete().eq('id', id);
  revalidateResearch();
  revalidateAdmin();
  redirect('/admin/reports?deleted=1');
}

// ── Scans ────────────────────────────────────────────────────────────────────
export async function saveScan(fd: FormData) {
  await requireAdmin();
  const db = createAdminClient();
  const id = str(fd, 'id') || null;
  const title = str(fd, 'title');
  if (!title) throw new Error('Title is required');
  const openQuestions = str(fd, 'open_questions').split('\n').map((s) => s.trim()).filter(Boolean);
  const row = {
    slug: str(fd, 'slug') ? slugify(str(fd, 'slug')) : slugify(title),
    title,
    territory: str(fd, 'territory') || 'uae-gcc',
    service: str(fd, 'service') || 'none',
    week_of: str(fd, 'week_of') || new Date().toISOString().slice(0, 10),
    signal: str(fd, 'signal'),
    question: str(fd, 'question'),
    finding: str(fd, 'finding') || null,
    interpretation: str(fd, 'interpretation') || null,
    open_questions: openQuestions,
    reviewed: bool(fd, 'reviewed'),
    sample: bool(fd, 'sample'),
    published: bool(fd, 'published'),
  };
  if (row.published && !row.reviewed) throw new Error('A scan must be marked reviewed before it is published.');
  const { error } = id ? await db.from('scans').update(row).eq('id', id) : await db.from('scans').insert(row);
  if (error) throw new Error(error.message);
  revalidateResearch();
  revalidatePath(`/research/weekly-scan/${row.slug}`);
  revalidateAdmin();
  redirect('/admin/scans?saved=1');
}

export async function deleteScan(fd: FormData) {
  await requireAdmin();
  const id = str(fd, 'id');
  if (!id) return;
  const db = createAdminClient();
  await db.from('scans').delete().eq('id', id);
  revalidateResearch();
  revalidateAdmin();
  redirect('/admin/scans?deleted=1');
}

// ── Partners ─────────────────────────────────────────────────────────────────
export async function savePartner(fd: FormData) {
  await requireAdmin();
  const db = createAdminClient();
  const id = str(fd, 'id') || null;
  const name = str(fd, 'name');
  if (!name) throw new Error('Name is required');
  const sections: { title: string; body: string }[] = [];
  for (let i = 0; i < 3; i++) { const t = str(fd, `section_title_${i}`), b = str(fd, `section_body_${i}`); if (t || b) sections.push({ title: t, body: b }); }
  const territories = fd.getAll('territories').map(String).filter(Boolean);
  const row = {
    slug: str(fd, 'slug') ? slugify(str(fd, 'slug')) : slugify(name),
    name, title: str(fd, 'title') || 'Partner', short_title: str(fd, 'short_title') || null,
    location: str(fd, 'location') || null, location_short: str(fd, 'location_short') || null,
    email: str(fd, 'email') || null, phone: str(fd, 'phone') || null, phone_label: str(fd, 'phone_label') || null,
    linkedin: str(fd, 'linkedin') || null, qualification: str(fd, 'qualification') || null, emphasis: str(fd, 'emphasis') || null,
    sections, portrait_path: str(fd, 'portrait_path') || null, territories,
    founder: bool(fd, 'founder'), sort_order: str(fd, 'sort_order') ? Number(str(fd, 'sort_order')) : 0, active: bool(fd, 'active'),
  };
  const { error } = id ? await db.from('partners').update(row).eq('id', id) : await db.from('partners').insert(row);
  if (error) throw new Error(error.message);
  for (const p of ['/', '/about', '/contact', '/research']) revalidatePath(p);
  revalidateAdmin();
  redirect('/admin/partners?saved=1');
}

export async function deletePartner(fd: FormData) {
  await requireAdmin();
  const id = str(fd, 'id');
  if (!id) return;
  const db = createAdminClient();
  await db.from('partners').delete().eq('id', id);
  for (const p of ['/', '/about', '/contact', '/research']) revalidatePath(p);
  revalidateAdmin();
  redirect('/admin/partners?deleted=1');
}

// ── Team ─────────────────────────────────────────────────────────────────────
export async function saveTeamMember(fd: FormData) {
  await requireAdmin();
  const db = createAdminClient();
  const id = str(fd, 'id') || null;
  const name = str(fd, 'name');
  if (!name) throw new Error('Name is required');
  const row = {
    slug: str(fd, 'slug') ? slugify(str(fd, 'slug')) : slugify(name),
    name, role: str(fd, 'role') || 'Team', location: str(fd, 'location') || null, email: str(fd, 'email') || null,
    linkedin: str(fd, 'linkedin') || null, bio: str(fd, 'bio') || null, portrait_path: str(fd, 'portrait_path') || null,
    sort_order: str(fd, 'sort_order') ? Number(str(fd, 'sort_order')) : 0, active: bool(fd, 'active'),
  };
  const { error } = id ? await db.from('team_members').update(row).eq('id', id) : await db.from('team_members').insert(row);
  if (error) throw new Error(error.message);
  revalidatePath('/about');
  revalidateAdmin();
  redirect('/admin/team?saved=1');
}

export async function deleteTeamMember(fd: FormData) {
  await requireAdmin();
  const id = str(fd, 'id');
  if (!id) return;
  const db = createAdminClient();
  await db.from('team_members').delete().eq('id', id);
  revalidatePath('/about');
  revalidateAdmin();
  redirect('/admin/team?deleted=1');
}

// ── Settings ─────────────────────────────────────────────────────────────────
export async function saveSettings(fd: FormData) {
  await requireAdmin();
  const db = createAdminClient();
  const portraits: Record<string, string> = {};
  for (const k of ['joel', 'quincy', 'wayne']) { const p = str(fd, `portrait_${k}`); if (p) portraits[k] = p; }
  const { error } = await db.from('site_settings').update({ featured_report_id: str(fd, 'featured_report_id') || null, portraits }).eq('id', 1);
  if (error) throw new Error(error.message);
  revalidatePath('/'); revalidatePath('/about'); revalidatePath('/research');
  revalidateAdmin();
  redirect('/admin/settings?saved=1');
}

// ── Uploads: the browser uploads straight to Storage with a signed upload URL ─
const IMAGE_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const FILE_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/zip': 'zip',
};

/** Returns { bucket, path, token } for a direct-to-storage upload. Path is server-generated; the client filename is never used. */
export async function createUploadTarget(kind: 'image' | 'file', mime: string, folder: string) {
  await requireAdmin();
  const types = kind === 'image' ? IMAGE_TYPES : FILE_TYPES;
  const ext = types[mime];
  if (!ext) throw new Error(`Unsupported file type: ${mime}`);
  const safeFolder = /^[a-z0-9-]+$/.test(folder) ? folder : 'misc';
  const bucket = kind === 'image' ? PUBLIC_MEDIA : RESEARCH_FILES;
  const path = `${safeFolder}/${randomUUID()}.${ext}`;
  const db = createAdminClient();
  const { data, error } = await db.storage.from(bucket).createSignedUploadUrl(path);
  if (error) throw new Error(error.message);
  return { bucket, path, token: data.token };
}
