import PartnerCard from '@/components/dss/PartnerCard';
import { publicMediaUrl, type TeamMember } from '@/lib/data';
import type { PartnerView } from '@/lib/partners';

/** A team member is shown with the partner card: same portrait size, same lines, same profile paragraphs. */
export default function TeamCard({ member, full = true }: { member: TeamMember; full?: boolean }) {
  const title = member.title ?? member.role ?? 'Team';
  const view: PartnerView = {
    slug: member.slug, name: member.name, title, shortTitle: member.short_title ?? title,
    location: member.location ?? '', locationShort: member.location_short ?? member.location ?? '',
    email: member.email, phone: member.phone, phoneLabel: member.phone_label, linkedin: member.linkedin,
    qualification: member.qualification, emphasis: member.emphasis ?? member.bio ?? '',
    sections: member.sections ?? [], portrait: publicMediaUrl(member.portrait_path) ?? null,
    initials: member.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
    territories: member.territories ?? [], founder: false,
  };
  return <PartnerCard partner={view} full={full} />;
}
