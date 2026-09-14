/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    // Content collections (Keystatic-managed MDX) must be traced into the serverless bundle.
    outputFileTracingIncludes: {
      '/research/**': ['./content/**/*'],
      '/research/weekly-scan/rss.xml': ['./content/**/*'],
      '/sitemap.xml': ['./content/**/*'],
    },
  },
  async redirects() {
    return [
      // Retired "How We Work" pages → the Decision Support System (Revamp, Sept 2026)
      { source: '/how-we-work', destination: '/decision-support-system', permanent: true },
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
