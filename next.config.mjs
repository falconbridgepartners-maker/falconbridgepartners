/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    // The link-preview image route reads its fonts and logo from assets/og at run time.
    outputFileTracingIncludes: { '/og/[kind]/[slug]': ['./assets/og/**/*'] },
  },
  async redirects() {
    return [
      // Retired "How We Work" pages → the Decision Support System (Revamp, Sept 2026)
      { source: '/how-we-work', destination: '/decision-support-system', permanent: true },
      // Week 43 signals imported twice (20 Oct 2026): the copies taken down point to the copies kept.
      { source: '/research/weekly-scan/south-africa-week-43-2026-godongwana-takes-rare-fiscal-tailwinds-into-wednesdays', destination: '/research/weekly-scan/south-africa-week-43-2026-godongwana-takes-rare-fiscal-tailwinds-into', permanent: true },
      { source: '/research/weekly-scan/uae-gcc-week-43-2026-uae-cabinet-approves-dh292-5-billion-federal-budget', destination: '/research/weekly-scan/uae-gcc-week-43-2026-uae-cabinet-approves-dh292-5-billion-federal-budget-for', permanent: true },
      { source: '/how-we-work/internal-judgement', destination: '/decision-support-system/coaching', permanent: true },
      { source: '/how-we-work/external-signal', destination: '/decision-support-system/research', permanent: true },
      { source: '/how-we-work/execution-reality', destination: '/decision-support-system/execution-modelling', permanent: true },
      // The insights scaffold's routes → Research
      { source: '/insights', destination: '/research/weekly-scan', permanent: false },
      { source: '/insights/rss.xml', destination: '/research/weekly-scan/rss.xml', permanent: false },
      { source: '/insights/:slug', destination: '/research/weekly-scan/:slug', permanent: false },
    ];
  },
};

export default nextConfig;
