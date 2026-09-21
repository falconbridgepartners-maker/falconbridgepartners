import Link from 'next/link';

export const input = "w-full rounded-lg bg-white/3 border border-brand-gold/25 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-gold/70";
export const label = "text-xs font-bold text-white/70 block mb-1.5";
export const btn = "inline-flex items-center gap-2 rounded-full bg-brand-gold text-brand-navy font-bold text-sm px-5 py-2.5 hover:bg-brand-gold-pale transition-colors disabled:opacity-60";
export const btnGhost = "inline-flex items-center gap-2 rounded-full border border-brand-gold/40 text-white/80 text-sm px-5 py-2.5 hover:bg-white/5 transition-colors";

export function PageHead({ title, sub, action }: { title: string; sub?: string; action?: { href: string; label: string } }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl md:text-4xl">{title}</h1>
        {sub && <p className="text-white/55 text-sm mt-1">{sub}</p>}
      </div>
      {action && <Link href={action.href} className={btn}>{action.label}</Link>}
    </div>
  );
}

export function Notice({ q }: { q?: { saved?: string; deleted?: string } }) {
  if (q?.saved) return <p className="tile-ivory p-3 text-sm mb-6">Saved.</p>;
  if (q?.deleted) return <p className="tile-ivory p-3 text-sm mb-6">Deleted.</p>;
  return null;
}

export function Field({ id, title, children, hint }: { id: string; title: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label htmlFor={id} className={label}>{title}</label>
      {children}
      {hint && <p className="text-[0.7rem] text-white/40 mt-1">{hint}</p>}
    </div>
  );
}

export function Check({ name, title, defaultChecked, hint }: { name: string; title: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex items-start gap-3 text-sm text-white/80">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-1 accent-[#c8a86a]" />
      <span>{title}{hint && <span className="block text-[0.7rem] text-white/40">{hint}</span>}</span>
    </label>
  );
}
