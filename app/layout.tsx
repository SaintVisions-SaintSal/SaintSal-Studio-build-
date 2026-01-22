import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'SaintSal™ - AI Platform for Business Domination',
  description: 'Multi-Model AI Intelligence - Research properties, analyze ROI, find leads, explore lending options. Your GOTTA GUY™ for everything business.',
  manifest: '/manifest.json',
  applicationName: 'SaintSal™',
  keywords: ['AI', 'business intelligence', 'real estate', 'leads', 'loans', 'CRM', 'automation'],
  authors: [{ name: 'Saint Vision Technologies LLC' }],
  creator: 'Saint Vision Technologies LLC',
  publisher: 'Saint Vision Technologies LLC',
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SaintSal™',
    startupImage: [
      {
        url: '/splash/splash-1125x2436.png',
        media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/splash/splash-1170x2532.png',
        media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/splash/splash-1179x2556.png',
        media: '(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/splash/splash-1284x2778.png',
        media: '(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/splash/splash-1290x2796.png',
        media: '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://saintsal.ai',
    siteName: 'SaintSal™',
    title: 'SaintSal™ - AI Platform for Business Domination',
    description: 'Multi-Model AI Intelligence - Your GOTTA GUY™ for properties, leads, loans, and more.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SaintSal™ AI Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SaintSal™ - AI Platform for Business Domination',
    description: 'Multi-Model AI Intelligence - Your GOTTA GUY™ for properties, leads, loans, and more.',
    images: ['/og-image.png'],
    creator: '@saintsalai',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180' },
      { url: '/icons/apple-touch-icon-152x152.png', sizes: '152x152' },
      { url: '/icons/apple-touch-icon-144x144.png', sizes: '144x144' },
      { url: '/icons/apple-touch-icon-120x120.png', sizes: '120x120' },
    ],
    other: [
      { rel: 'mask-icon', url: '/icons/safari-pinned-tab.svg', color: '#fbbf24' },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'msapplication-TileColor': '#0a0a0a',
    'msapplication-config': '/browserconfig.xml',
  },
    generator: 'v0.app'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbbf24' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <head>
        {/* PWA & iOS Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SaintSal™" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#fbbf24" media="(prefers-color-scheme: light)" />
        
        {/* Preconnect to external services */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.anthropic.com" />
        <link rel="preconnect" href="https://api.openai.com" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://api.anthropic.com" />
      </head>
      <body className={`${inter.className} antialiased bg-background text-foreground`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
