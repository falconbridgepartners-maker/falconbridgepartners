import 'server-only';
import type { StaticImageData } from 'next/image';
import joelImage from '@/assets/images/joel-arcus-card.png';
import quincyImage from '@/assets/images/quincy-beukes-card.png';
import wayneImage from '@/assets/images/wayne-loraine-grews.png';
import { partners as builtIn } from '@/content/site';
import { getPartners, getSiteSettings, publicMediaUrl, type PartnerRow } from '@/lib/data';

/** What the site components render. Built from the partners table, or from the built-in list until the table exists. */
export type PartnerView = {
  slug: string; name: string; title: string; shortTitle: string; location: string; locationShort: string;
  email: string | null; phone: string | null; phoneLabel: string | null; linkedin: string | null; qualification: string | null; emphasis: string;
  sections: { title: string; body: string }[]; portrait: string | StaticImageData | null; initials: string; territories: string[]; founder: boolean;
};

const builtInImages: Record<string, string | StaticImageData> = { joel: joelImage, quincy: quincyImage, wayne: wayneImage };
const builtInBySlug: Record<string, string | StaticImageData> = { 'joel-arcus': joelImage, 'quincy-jc-beukes': quincyImage, 'wayne-loraine-grews': wayneImage };
const builtInTerritories: Record<string, string[]> = {
  'quincy-jc-beukes': ['south-africa', 'mauritius', 'new-zealand', 'singapore'], 'joel-arcus': ['uae-gcc'], 'wayne-loraine-grews': ['north-carolina'],
};
const initialsOf = (name: string) => name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

export async function getSitePartners(): Promise<PartnerView[]> {
  const [rows, settings] = await Promise.all([getPartners(), getSiteSettings()]);
  if (rows.length > 0) {
    return rows.map((r: PartnerRow) => ({
      slug: r.slug, name: r.name, title: r.title, shortTitle: r.title.replace(/^Co-Founder & /i, ''), location: r.location ?? '', locationShort: r.location_short ?? r.location ?? '',
      email: r.email, phone: r.phone, phoneLabel: r.phone_label, linkedin: r.linkedin, qualification: r.qualification, emphasis: r.emphasis ?? '',
      sections: r.sections ?? [], portrait: publicMediaUrl(r.portrait_path) ?? builtInBySlug[r.slug] ?? null, initials: initialsOf(r.name), territories: r.territories ?? [], founder: r.founder,
    }));
  }
  return builtIn.map((p) => ({
    slug: p.slug, name: p.name, title: p.title, shortTitle: p.title.replace(/^Co-Founder & /, ''), location: p.location, locationShort: p.location.replace('Based in ', '').replace(', USA', ''),
    email: p.email, phone: null, phoneLabel: null, linkedin: p.linkedin ?? null, qualification: p.qualification ?? null, emphasis: p.emphasis,
    sections: p.sections, portrait: (p.image && settings.portraits[p.image]) ? publicMediaUrl(settings.portraits[p.image]) : (p.image ? builtInImages[p.image] : null),
    initials: p.initials, territories: builtInTerritories[p.slug] ?? [], founder: p.slug !== 'wayne-loraine-grews',
  }));
}
