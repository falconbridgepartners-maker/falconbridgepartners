import PageHero from '@/components/dss/PageHero';
import { Section } from '@/components/dss/Tiles';

export const metadata = { title: 'Payment received — FalconBridge Partners', robots: { index: false, follow: false } };

export default function ThanksPage() {
  return (
    <>
      <PageHero eyebrow="Research licence" title="Thank you. Your payment is complete." governing="Stripe has emailed you a receipt and invoice. Your research pack and your licence statement follow by email within a few minutes." />
      <Section>
        <p className="text-white/70 max-w-2xl">Questions about your licence? Write to <a href="mailto:joel@falconbp.com" className="text-brand-gold-pale underline underline-offset-4">joel@falconbp.com</a>. The full terms are in our <a href="/legal/research-licences" className="text-brand-gold-pale underline underline-offset-4">Research Licences</a>.</p>
      </Section>
    </>
  );
}
