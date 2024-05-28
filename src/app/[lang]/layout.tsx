import {
  ConversionBar,
  Footer,
  Header,
  WhatsappButton,
} from "@/components/ui/shared";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Metadata, Viewport } from "next";
import { GoogleTagManager } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { Locale, i18n } from "../../../i18n.config";
import { getDictionary } from "@/lib/dictionary";

const montserrat = Montserrat({ subsets: ["latin"] });

interface Props {
  children: React.ReactNode;
  params: { lang: Locale };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  colorScheme: "normal",
  themeColor: "#1B9CD9",
};

export const generateMetadata = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}): Promise<Metadata> => {
  const { metadata } = await getDictionary(lang);
  return {
    title: {
      template: "%s | imSoft",
      default: "imSoft",
    },
    description: metadata.layout.description,
    keywords: metadata.layout.keywords,
    generator: "Next.js, Tailwind CSS, TypeScript, React",
    applicationName: "imSoft",
    referrer: "origin-when-cross-origin",
    authors: [
      { name: "Brandon Uriel Garcia Ramos", url: "https://www.imsoft.io/" },
    ],
    creator: "Brandon Uriel Garcia Ramos",
    publisher: "Brandon Uriel Garcia Ramos",
    formatDetection: {
      email: true,
      address: false,
      telephone: true,
    },
    metadataBase: new URL("https://www.imsoft.io/"),
    alternates: {
      canonical: "/",
      languages: {
        "es-MX": "/es-MX",
      },
    },
    openGraph: {
      title: "imSoft",
      description: metadata.layout.openGraph.description,
      type: "website",
      url: "https://www.imsoft.io/",
      siteName: "imSoft",
      images: [
        {
          url: "https://res.cloudinary.com/https-imsoft-io/image/upload/v1706594670/imsoft-images/imsoft/logotipo-imsoft-cuadrado.png",
          width: 783,
          height: 783,
          alt: "imSoft Logo",
        },
      ],
      locale: "es_MX",
    },
    robots: {
      index: true,
      follow: true,
      nocache: true,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: [
        {
          url: "https://res.cloudinary.com/https-imsoft-io/image/upload/v1716786342/imsoft-images/manifest/favicon-imSoft.png",
        },
        new URL(
          "https://res.cloudinary.com/https-imsoft-io/image/upload/v1716786342/imsoft-images/manifest/favicon-imSoft.png",
          "https://www.imsoft.io/"
        ),
      ],
      shortcut: [
        "https://res.cloudinary.com/https-imsoft-io/image/upload/v1716786342/imsoft-images/manifest/favicon-imSoft.png",
      ],
      apple: [
        {
          url: "https://res.cloudinary.com/https-imsoft-io/image/upload/v1716786892/imsoft-images/manifest/apple-icon-57x57.png",
          sizes: "57x57",
          type: "image/png",
        },
        {
          url: "https://res.cloudinary.com/https-imsoft-io/image/upload/v1716786892/imsoft-images/manifest/apple-icon-60x60.png",
          sizes: "60x60",
          type: "image/png",
        },
        {
          url: "https://res.cloudinary.com/https-imsoft-io/image/upload/v1716786892/imsoft-images/manifest/apple-icon-72x72.png",
          sizes: "72x72",
          type: "image/png",
        },
        {
          url: "https://res.cloudinary.com/https-imsoft-io/image/upload/v1716786341/imsoft-images/manifest/apple-icon-76x76.png",
          sizes: "76x76",
          type: "image/png",
        },
        {
          url: "https://res.cloudinary.com/https-imsoft-io/image/upload/v1716786341/imsoft-images/manifest/apple-icon-114x114.png",
          sizes: "114x114",
          type: "image/png",
        },
        {
          url: "https://res.cloudinary.com/https-imsoft-io/image/upload/v1716786341/imsoft-images/manifest/apple-icon-120x120.png",
          sizes: "120x120",
          type: "image/png",
        },
        {
          url: "https://res.cloudinary.com/https-imsoft-io/image/upload/v1716786341/imsoft-images/manifest/apple-icon-144x144.png",
          sizes: "144x144",
          type: "image/png",
        },
        {
          url: "https://res.cloudinary.com/https-imsoft-io/image/upload/v1716786342/imsoft-images/manifest/apple-icon-152x152.png",
          sizes: "152x152",
          type: "image/png",
        },
        {
          url: "https://res.cloudinary.com/https-imsoft-io/image/upload/v1716786341/imsoft-images/manifest/apple-icon-180x180.png",
          sizes: "180x180",
          type: "image/png",
        },
      ],
      other: [
        {
          rel: "https://res.cloudinary.com/https-imsoft-io/image/upload/v1716786892/imsoft-images/manifest/android-icon-192x192.png",
          url: "/android-icon-192x192.png",
        },
        {
          rel: "favicon-16x16",
          url: "https://res.cloudinary.com/https-imsoft-io/image/upload/v1716786342/imsoft-images/manifest/favicon-16x16.png",
        },
        {
          rel: "favicon-32x32",
          url: "https://res.cloudinary.com/https-imsoft-io/image/upload/v1716786341/imsoft-images/manifest/favicon-32x32.png",
        },
        {
          rel: "favicon-96x96",
          url: "https://res.cloudinary.com/https-imsoft-io/image/upload/v1716786342/imsoft-images/manifest/favicon-96x96.png",
        },
        {
          rel: "favicon-imSoft",
          url: "https://res.cloudinary.com/https-imsoft-io/image/upload/v1716786342/imsoft-images/manifest/favicon-imSoft.png",
        },
      ],
    },
    manifest: "https://www.imsoft.io/manifest.json",
    twitter: {
      card: "summary_large_image",
      title: "imSoft",
      description: metadata.layout.twitter.description,
      creator: "@weareimsoft",
      images: {
        url: "https://res.cloudinary.com/https-imsoft-io/image/upload/v1706594670/imsoft-images/imsoft/logotipo-imsoft-cuadrado.png",
        alt: "imSoft Logo",
      },
    },
    category: "technology",
  };
};

// export const metadata: Metadata = {
  
// };

export const generateStaticParams = async () => {
  return i18n.locales.map((locale) => ({ lang: locale }));
};

export default async function RootLayout({
  children,
  params: { lang },
}: Props) {
  const { component } = await getDictionary(lang);

  return (
    <html lang={lang} className={montserrat.className}>
      <body>
        <header className="sticky top-0 z-50">
          <ConversionBar
            title={component.shared.conversionBar.title}
            callToAction={component.shared.conversionBar.callToAction}
          />
          <Header
            firstColumn={component.shared.header.firstColumn}
            secondColumn={component.shared.header.secondColumn}
            thirdColumn={component.shared.header.thirdColumn}
            fourthColumn={component.shared.header.fourthColumn}
            fifthColumn={component.shared.header.fifthColumn}
            sixthColumn={component.shared.header.sixthColumn}
            services={component.shared.header.services}
            callsToAction={component.shared.header.callsToAction}
            company={component.shared.header.company}
            articles={component.shared.header.articles}
            blogPosts={component.shared.header.blogPosts}
            callToActionServices={component.shared.header.callToActionServices}
            moreTitle1={component.shared.header.moreTitle1}
            moreTitle2={component.shared.header.moreTitle2}
            moreTitle3={component.shared.header.moreTitle3}
            moreCallToAction={component.shared.header.moreCallToAction}
            titleResponsive1={component.shared.header.titleResponsive1}
            titleResponsive2={component.shared.header.titleResponsive2}
            titleResponsive3={component.shared.header.titleResponsive3}
            titleResponsive4={component.shared.header.titleResponsive4}
            titleResponsive5={component.shared.header.titleResponsive5}
            titleResponsive6={component.shared.header.titleResponsive6}
            callToActionResponsive={
              component.shared.header.callToActionResponsive
            }
            lang={lang}
          />
        </header>
        {children}
        <WhatsappButton />
        <Footer
          description={component.shared.footer.description}
          firstColumn={component.shared.footer.firstColumn}
          secondColumn={component.shared.footer.secondColumn}
          thirdColumn={component.shared.footer.thirdColumn}
          fourthColumn={component.shared.footer.fourthColumn}
          copyRight={component.shared.footer.copyRight}
          lang={lang}
        />

        <GoogleTagManager gtmId={"G-F34MP2JXNX"} />
        <GoogleTagManager gtmId={"GTM-PXS9JKGT"} />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
