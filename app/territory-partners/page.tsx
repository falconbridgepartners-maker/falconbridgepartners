import type { Metadata } from 'next';
import ContactForm from '@/components/dss/ContactForm';
import { territoryPartners } from '@/content/site';

export const metadata: Metadata = {
  title: 'Territory partners — FalconBridge Partners',
  description: territoryPartners.intro,
};

export default function TerritoryPartnersPage() {
  return <ContactForm variant="territory" />;
}
