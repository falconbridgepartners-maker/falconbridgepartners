import Link from 'next/link';
import { ArrowRight, Download } from 'lucide-react';

/** The two ways to get a ready-made study: the free personal download, or a business licence. */
export default function GetThisStudy({ slug, fromUsd, freeHref, salesOpen = true }: { slug: string; fromUsd: number; freeHref: string | null; salesOpen?: boolean }) {
  return (
    <div className="tile p-6 space-y-4">
      <p className="label-tech">Get this study</p>
      <div className="grid gap-3">
        {freeHref && (
          <a href={freeHref} className="rounded-xl border border-white/15 p-4 hover:border-brand-gold/60 transition-colors flex items-start justify-between gap-3">
            <span><span className="block text-white font-bold">Free download</span><span className="block text-sm text-white/60 mt-1">Personal use only, for 90 days.</span></span>
            <Download className="w-4 h-4 text-brand-gold mt-1 shrink-0" />
          </a>
        )}
        {salesOpen ? <Link href={`/research/studies/${slug}/buy`} className="rounded-xl border border-brand-gold/50 bg-brand-gold/10 p-4 hover:border-brand-gold transition-colors flex items-start justify-between gap-3">
          <span><span className="block text-white font-bold">Buy a business licence</span><span className="block text-sm text-white/60 mt-1">Single Use or Multi-Use. From US${fromUsd.toLocaleString('en-US')}.</span></span>
          <ArrowRight className="w-4 h-4 text-brand-gold mt-1 shrink-0" />
        </Link> : (
          <div className="rounded-xl border border-white/15 p-4">
            <span className="block text-white font-bold">Business licence</span>
            <span className="block text-sm text-white/60 mt-1">Online purchase is paused for a short while. Write to <a href="mailto:joel@falconbp.com" className="text-brand-gold-pale underline underline-offset-4">joel@falconbp.com</a> to license this study.</span>
          </div>
        )}
      </div>
      <p className="text-xs text-white/50">Need exclusivity or public use? <Link href="/decision-support-system" className="text-brand-gold-pale underline underline-offset-4">Commission a study</Link>. All use is under our <Link href="/legal/research-licences" className="text-brand-gold-pale underline underline-offset-4">Research Licences</Link>.</p>
    </div>
  );
}
