'use client';
import { useState } from 'react';
import { Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { createUploadTarget } from '@/lib/admin/actions';

type Props = {
  name: string;               // hidden input name that carries the storage path
  kind: 'image' | 'file';
  folder: string;             // e.g. covers, extracts, portraits, reports
  defaultPath?: string | null;
  label: string;
  previewUrl?: string | null; // for images: current public URL
  sizeName?: string;          // optional hidden input for size bytes
};

/** Direct-to-Storage upload: asks the server for a signed upload URL, then uploads from the browser (so 100 MB PDFs never pass through Vercel). */
export default function UploadField({ name, kind, folder, defaultPath, label, previewUrl, sizeName }: Props) {
  const [path, setPath] = useState(defaultPath ?? '');
  const [size, setSize] = useState<number | ''>('');
  const [preview, setPreview] = useState<string | null>(previewUrl ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const accept = kind === 'image' ? 'image/jpeg,image/png,image/webp' : '.pdf,.pptx,.docx,.zip';

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setError(null);
    try {
      const target = await createUploadTarget(kind, file.type, folder);
      const supabase = createClient();
      const { error } = await supabase.storage.from(target.bucket).uploadToSignedUrl(target.path, target.token, file, { contentType: file.type, upsert: true });
      if (error) throw error;
      setPath(target.path);
      setSize(file.size);
      if (kind === 'image') setPreview(URL.createObjectURL(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="tile p-4">
      <p className="text-xs font-bold text-white/70 mb-2">{label}</p>
      <div className="flex items-center gap-4">
        {kind === 'image' && (
          <div className="w-16 h-20 rounded-md bg-brand-navy-dark border border-brand-gold/20 overflow-hidden shrink-0">
            {preview && /* eslint-disable-next-line @next/next/no-img-element */ <img src={preview} alt="" className="w-full h-full object-cover" />}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <label className="inline-flex items-center gap-2 text-sm rounded-full border border-brand-gold/40 px-4 py-2 cursor-pointer hover:bg-white/5">
            <Upload className="w-4 h-4" /> {busy ? 'Uploading…' : path ? 'Replace' : 'Upload'}
            <input type="file" accept={accept} onChange={onChange} className="hidden" disabled={busy} />
          </label>
          <p className="text-[0.7rem] text-white/40 mt-2 truncate">{path || 'No file yet'}</p>
          {error && <p className="text-[0.75rem] text-red-200 mt-1">{error}</p>}
        </div>
        {path && <button type="button" onClick={() => { setPath(''); setPreview(null); setSize(''); }} className="text-xs text-white/40 hover:text-white">Remove</button>}
      </div>
      <input type="hidden" name={name} value={path} />
      {sizeName && <input type="hidden" name={sizeName} value={size} />}
    </div>
  );
}
