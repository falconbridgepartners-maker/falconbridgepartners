import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SiteChrome from '@/components/layout/SiteChrome';
import '@/index.css';

const title = 'FalconBridge Partners — Sharper thinking when the decision stays with you';
const description = 'Research and strategic support for consequential business decisions, combining experienced human judgement with proprietary, AI-assisted methods.';

export const metadata: Metadata = {
  metadataBase: new URL('https://falconbp.com'),
  title: { default: title, template: '%s' },
  description,
  openGraph: {
    type: 'website',
    siteName: 'FalconBridge Partners',
    title,
    description,
    url: 'https://falconbp.com',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'FalconBridge Partners' }],
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/og-default.png'] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-brand-navy text-brand-grey font-primary antialiased overflow-x-clip">
        <div className="app-wrapper">
          <div className="grain-overlay"></div>
          <SiteChrome><Navbar /></SiteChrome>
          <main>{children}</main>
          <SiteChrome><Footer /></SiteChrome>
        </div>
      </body>
    </html>
  );
}
