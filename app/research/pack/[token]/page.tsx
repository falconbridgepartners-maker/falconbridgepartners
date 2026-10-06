import type { Metadata } from 'next';
import Link from 'next/link';
import { Download } from 'lucide-react';
import PageHero from '@/components/dss/PageHero';
import Invitation from '@/components/dss/Invitation';
import { Section, Band } from '@/components/dss/Tiles';
import { territoryName } from '@/lib/data';
import { resolvePack, recordOpen } from '@/lib/packAccess';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata: Metadata = { title: 'Research pack — FalconBridge Partners', robots: { index: false, follow: false }, referrer: 'no-referrer' };

const mb = (n: number | null) => (n ? `${(n / 1048576).toFixed(n < 1048576 ? 2 : 1)} MB` : '');
const kind = (path: string | null) => ({ pdf: 'PDF', pptx: 'PowerPoint', docx: 'Word', zip: 'ZIP' } as Record<string, string>)[(path ?? '').split('.').pop() ?? ''] ?? '';

export default async function PackPage({ params }: { params: { token: string } }) {
  const grant = await resolvePack(params.token);

  if (!grant) {
    return (
      <>
        <PageHero eyebrow="Research pack" title="This link is not recognised" intro="The address may be incomplete, or the study may have been withdrawn. Ask for the pack again from the study’s page and a new link will be emailed to you." />
        <Section><Link href="/research/library" className="text-brand-gold-pale underline underline-offset-4">Go to the research library</Link></Section>
      </>
    );
  }

  const { report, files, request, expired } = grant;
  if (expired) {
    return (
      <>
        <PageHero eyebrow="Research pack" title="This link has expired" governing={report.title} intro="Pack links work for a limited time. Ask for the pack again and a new link will be emailed to you straight away." />
        <Section><Link href={`/research/studies/${report.slug}`} className="text-brand-gold-pale underline underline-offset-4">Ask for the pack again</Link></Section>
      </>
    );
  }

  await recordOpen(request);
  const until = new Date(request.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  return (
    <>
      <PageHero
        eyebrow={`Research pack · ${territoryName[report.territory] ?? report.territory}${report.year ? ` · ${report.year}` : ''}`}
        title={report.title}
        governing={report.subtitle ?? undefined}
        intro={`Prepared for ${request.full_name}, ${request.organisation}. This page works until ${until}.`}
      />
      <Section>
        <ol className="space-y-3 max-w-3xl">
          {files.map((f, i) => (
            <li key={f.id}>
              <a href={`/research/pack/${params.token}/file/${f.id}`} className="tile p-5 flex items-center gap-5 hover:border-brand-gold/60 transition-colors">
                <span className="governing text-xl w-6 shrink-0 text-center" aria-hidden="true">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-white font-bold">{f.label}</span>
                  <span className="block text-white/45 text-xs mt-0.5">{[kind(f.storage_path), mb(f.size_bytes)].filter(Boolean).join(' · ')}</span>
                </span>
                <Download className="w-4 h-4 text-brand-gold shrink-0" />
              </a>
            </li>
          ))}
        </ol>
        <p className="text-white/60 text-sm mt-6 max-w-3xl">Read them in the order shown. The first document explains how the report is built, what the evidence grades mean and where to enter the report for the time you have.</p>
        <div className="mt-12 space-y-8">
          <Band title="Findings are bounded" body={report.qualifier || 'Findings remain bounded by scope, evidence and date. The research supports your decision. It does not make it for you.'} />
          <Band title="Licensed for your own use" body="The pack is released under a Type-1 licence for the requester’s own use. FalconBridge Partners retains its research IP. Wider circulation, publication or reproduction needs our agreement." />
        </div>
      </Section>
      <Invitation compact />
    </>
  );
}
