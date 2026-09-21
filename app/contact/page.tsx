import type { Metadata } from 'next';
import ContactForm from '@/components/dss/ContactForm';
import { getSitePartners } from '@/lib/partners';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Start a conversation — FalconBridge Partners',
  description: 'What needs to be understood before your next decision? Bring the proposition, question or direction you are working on.',
};

export default async function ContactPage() {
  const partners = await getSitePartners();
  return <ContactForm partners={partners} />;
}
