import { Linkedin, Mail } from 'lucide-react';
import { publicMediaUrl, type TeamMember } from '@/lib/data';

export default function TeamCard({ member }: { member: TeamMember }) {
  const img = publicMediaUrl(member.portrait_path);
  const initials = member.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <article className="tile p-6 flex flex-col">
      <div className="flex gap-5 items-start">
        <div className="w-20 aspect-[4/5] rounded-xl bg-brand-navy-dark border border-brand-gold/30 overflow-hidden shrink-0 flex items-center justify-center">
          {img ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={img} alt={member.name} className="w-full h-full object-cover object-top" /> : <span className="font-technical text-xl font-bold text-brand-gold-pale">{initials}</span>}
        </div>
        <div className="min-w-0">
          <h3 className="text-lg leading-tight">{member.name}</h3>
          <p className="text-brand-gold-pale text-sm mt-1">{member.role}</p>
          {member.location && <p className="text-white/50 text-sm">{member.location}</p>}
        </div>
      </div>
      {member.bio && <p className="text-white/70 mt-4 text-[0.95rem]">{member.bio}</p>}
      {(member.linkedin || member.email) && (
        <div className="flex gap-3 mt-5 pt-4 border-t border-brand-gold/15">
          {member.linkedin && <a href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on LinkedIn`} className="p-2.5 border border-brand-gold/30 rounded-full text-white/80 hover:bg-brand-gold hover:text-brand-navy transition-colors"><Linkedin className="w-4 h-4" /></a>}
          {member.email && <a href={`mailto:${member.email}`} aria-label={`Email ${member.name}`} className="p-2.5 border border-brand-gold/30 rounded-full text-white/80 hover:bg-brand-gold hover:text-brand-navy transition-colors"><Mail className="w-4 h-4" /></a>}
        </div>
      )}
    </article>
  );
}
