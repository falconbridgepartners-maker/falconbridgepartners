import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { getTeam, publicMediaUrl } from '@/lib/data';
import { PageHead, Notice } from '@/components/admin/ui';

export default async function TeamList({ searchParams }: { searchParams?: { saved?: string; deleted?: string } }) {
  const team = await getTeam({ includeInactive: true });
  return (
    <>
      <PageHead title="Team" sub="The “Our Team” section on the About page, under The Partners." action={{ href: '/admin/team/new', label: '+ Add team member' }} />
      <Notice q={searchParams} />
      {team.length === 0 && <p className="text-white/55 text-sm mb-6">No team members yet. The About page shows the section once the first one is added.</p>}
      <div className="space-y-3">
        {team.map((m) => {
          const img = publicMediaUrl(m.portrait_path);
          return (
            <div key={m.id} className="tile p-4 flex items-center gap-4">
              <div className="w-12 h-14 rounded-md bg-brand-navy-dark border border-brand-gold/20 overflow-hidden shrink-0">
                {img && /* eslint-disable-next-line @next/next/no-img-element */ <img src={img} alt="" className="w-full h-full object-cover object-top" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-bold truncate">{m.name} <span className="text-white/45 font-normal">· {m.role}</span></p>
                <p className="text-white/50 text-xs mt-1">{m.location ?? ''}{!m.active ? ' · hidden' : ''}</p>
              </div>
              <Link href={`/admin/team/${m.id}`} className="p-2.5 rounded-full border border-brand-gold/30 text-white/80 hover:bg-white/5" aria-label="Edit"><Pencil className="w-4 h-4" /></Link>
            </div>
          );
        })}
      </div>
    </>
  );
}
