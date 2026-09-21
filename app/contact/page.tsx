import type { Metadata } from 'next';
import ContactForm from '@/components/dss/ContactForm';

export const metadata: Metadata = {
  title: 'Start a conversation — FalconBridge Partners',
  description: 'What needs to be understood before your next decision? Bring the proposition, question or direction you are working on.',
};

export default function ContactPage() {
  return <ContactForm />;
}
