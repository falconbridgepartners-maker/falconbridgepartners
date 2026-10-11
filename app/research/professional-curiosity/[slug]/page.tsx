import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Invitation from '@/components/dss/Invitation';
import PieceView from '@/components/dss/PieceView';
import { Section } from '@/components/dss/Tiles';
import { NextLink } from '@/components/dss/Tiles';
import { PieceLinks, TerritoryLine } from '@/components/dss/RelatedResearch';
import { getPieceBySlug, getPublishedPieces, getScanForStudy, getStudyForPiece, publicMediaUrl, territoryName, weekText } from '@/lib/data';
import { pieceSummary } from '@/lib/pieces';
import { otherPieces, territoryPath } from '@/lib/related';
import { generatedImagePath, shareMetadata } from '@/lib/share';
import { JsonLd, articleLd, breadcrumbLd } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getPieceBySlug(params.slug);
  if (!p) return {};
  const own = publicMediaUrl(p.share_image_path);
  return shareMetadata({
    pageTitle: `${p.content.headline} — FalconBridge Partners`,
    title: p.content.headline,
    description: pieceSummary(p),
    path: `/research/professional-curiosity/${p.slug}`,
    image: own ? { url: own, generated: false } : { url: generatedImagePath('piece', p.slug), generated: true },
    publishedTime: p.published_at,
  });
}

export default async function PiecePage({ params }: { params: { slug: string } }) {
  const p = await getPieceBySlug(params.slug);
  if (!p) notFound();
  const [study, all] = await Promise.all([getStudyForPiece(p), getPublishedPieces()]);
  const scan = p.report_id ? await getScanForStudy(p.report_id) : null;
  const siblings = otherPieces(all, p);
  const place = territoryName[p.territory] ?? p.territory;
  const own = publicMediaUrl(p.share_image_path);
  const ld = [
    breadcrumbLd([{ name: 'Research', path: '/research' }, { name: 'Professional Curiosity', path: '/research/professional-curiosity' }, { name: place, path: territoryPath(p.territory) }, { name: p.content.headline, path: `/research/professional-curiosity/${p.slug}` }]),
    articleLd({ headline: p.content.headline, description: pieceSummary(p), path: `/research/professional-curiosity/${p.slug}`, image: own ?? generatedImagePath('piece', p.slug), published: p.published_at, section: `Professional Curiosity · ${place}` }),
  ];
  return (
    <>
      <JsonLd data={ld} />
      <PieceView piece={p} study={study} />
      <Section eyebrow="Around this piece">
        {scan && <NextLink href={`/research/weekly-scan/${scan.slug}`} label="The Weekly Signal that started it" sub={[territoryName[scan.territory] ?? scan.territory, weekText(scan.week_label) ?? `week of ${scan.week_of}`, scan.question].join(' · ')} />}
        <PieceLinks pieces={siblings} heading="More Professional Curiosity" />
        <TerritoryLine territory={p.territory} index={{ href: '/research/professional-curiosity', label: 'All Professional Curiosity pieces' }} />
      </Section>
      <Invitation compact />
    </>
  );
}
