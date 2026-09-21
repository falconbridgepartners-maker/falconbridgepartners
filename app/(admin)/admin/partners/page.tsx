import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { getPartners, publicMediaUrl, territoryName } from '@/lib/data';
import { PageHead, Notice } from '@/components/admin/ui';

export default async function PartnersList({ searchParams }: { searchParams?: { saved?: string; deleted?: string } }) {
  const partners = await getPartners({ includeInactive: true });
  return (
    <>
      <PageHead title="Partners" sub="Who appears on About, Home, the map, the footer and the contact page." action={{ href: '/admin/partners/new', label: '+ Add partner' }} />
      <Notice q={searchParams} />
      {partners.length === 0 && <p className="tile-ivory p-4 text-sm mb-6">No partners in the database yet — the site is showing the built-in three. Run <code>supabase/002_partners.sql</code> to seed them.</p>}
      <div className="space-y-3">
        {partners.map((p) => {
          const img = publicMediaUrl(p.portrait_path);
          return (
            <div key={p.id} className="tile p-4 flex items-center gap-4">
              <div className="w-12 h-14 rounded-md bg-brand-navy-dark border border-brand-gold/20 overflow-hidden shrink-0">
                {img && /* eslint-disable-next-line @next/next/no-img-element */ <img src={img} alt="" className="w-full h-full object-cover object-top" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-bold truncate">{p.name} <span className="text-white/45 font-normal">· {p.title}</span></p>
                <p className="text-white/50 text-xs mt-1">{p.location_short ?? p.location} · {p.territories.map((t) => territoryName[t] ?? t).join(', ') || 'no territories'}{p.founder ? ' · founder' : ''}{!p.active ? ' · hidden' : ''}</p>
              </div>
              <Link href={`/admin/partners/${p.id}`} className="p-2.5 rounded-full border border-brand-gold/30 text-white/80 hover:bg-white/5" aria-label="Edit"><Pencil className="w-4 h-4" /></Link>
            </div>
          );
        })}
      </div>
    </>
  );
}
