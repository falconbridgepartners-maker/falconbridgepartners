/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    outputFileTracingIncludes: {
      '/insights/**': ['./content/**/*'],
      '/insights/rss.xml': ['./content/**/*'],
      '/sitemap.xml': ['./content/**/*'],
    },
  },
};

export default nextConfig;
