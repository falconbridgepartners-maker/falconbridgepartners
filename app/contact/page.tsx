import type { Metadata } from 'next';
import ContactForm from '@/components/dss/ContactForm';
import { researchBreakActive } from '@/lib/data';

// Rendered per request so the year-end notice appears and disappears on its dates.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  alternates: { canonical: '/contact' },
  title: 'Start a conversation — FalconBridge Partners',
  description: 'What needs to be understood before your next decision? Bring the proposition, question or direction you are working on.',
};

export default function ContactPage() {
  return <ContactForm researchBreak={researchBreakActive()} />;
}
