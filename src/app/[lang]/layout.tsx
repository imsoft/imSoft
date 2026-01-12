import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { notFound } from 'next/navigation';
import { getDictionary, hasLocale } from './dictionaries';
import { ThemeProvider } from '@/components/theme-provider';
import { ConditionalAnalytics } from '@/components/analytics/conditional-analytics';
import { Toaster } from '@/components/ui/sonner';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';
import Script from 'next/script';
import { CookieBanner } from '@/components/cookies/cookie-banner';
import { CookiePreferences } from '@/components/cookies/cookie-preferences';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return generateSEOMetadata({}, lang);
}

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'es' }]
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io';

  // Structured data para Organization
  const organizationStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'imSoft',
    url: SITE_URL,
    logo: `${SITE_URL}/logos/logo-imsoft-blue.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Spanish', 'English'],
    },
    sameAs: [],
  };

  return (
    <html lang={lang} suppressHydrationWarning className="overflow-x-hidden">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="imSoft" />
        <link rel="apple-touch-icon" href="/manifest/ios/180.png" />
        <Script
          id="organization-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationStructuredData),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <ConditionalAnalytics />
          <CookieBanner lang={lang as 'es' | 'en'} dict={dict} />
          <CookiePreferences lang={lang as 'es' | 'en'} dict={dict} />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

