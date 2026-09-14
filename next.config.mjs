/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      // Retired "How We Work" pages → the Decision Support System (Revamp, Sept 2026)
      { source: '/how-we-work', destination: '/decision-support-system', permanent: true },
      { source: '/how-we-work/internal-judgement', destination: '/decision-support-system/coaching', permanent: true },
      { source: '/how-we-work/external-signal', destination: '/decision-support-system/research', permanent: true },
      { source: '/how-we-work/execution-reality', destination: '/decision-support-system/execution-modelling', permanent: true },
    ];
  },
};

export default nextConfig;
