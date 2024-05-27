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

export const metadata: Metadata = {
  title: {
    template: "%s | imSoft",
    default: "imSoft",
  },
  description:
    "imSoft: Desarrollo de software, SEO, sitio web, ecommerce, aplicaciones web, consultoria en Guadalajara, Jalisco, México",
  generator: "Next.js, Tailwind CSS, TypeScript, React",
  applicationName: "imSoft",
  referrer: "origin-when-cross-origin",
  keywords: [
    "imSoft",
    "software",
    "seo",
    "web",
    "ecommerce",
    "apps",
    "consultoria",
    "sitio web",
    "pagina web",
    "desarrollo de software",
    "desarrollo web personalizado",
    "empresa de desarrollo de aplicaciones",
    "programación a medida",
    "equipo de ingenieros de software",
    "soluciones de software empresarial",
    "desarrollo ágil de software",
    "consultoría en desarrollo de aplicaciones",
    "servicios de codificación de calidad",
    "lenguajes de programación modernos",
    "arquitectura de software escalable",
    "mejores prácticas de desarrollo de software",
    "desarrollo de aplicaciones móviles",
    "experiencia de usuario (ux) en aplicaciones",
    "integración de sistemas tecnológicos",
    "automatización en el desarrollo",
    "consultores de software altamente calificados",
    "desarrollo backend y frontend",
    "optimización de rendimiento de software",
    "servicios de control de calidad (qa) en software",
    "mantenimiento y actualización de aplicaciones",
    "soluciones de software personalizadas",
    "desarrollo de software para startups",
    "innovación en desarrollo de aplicaciones",
    "herramientas de desarrollo de software",
    "desarrollo de prototipos de aplicaciones",
    "soluciones de software escalables",
    "equipo de desarrollo devops",
    "desarrollo de software basado en la nube",
    "desarrollo de aplicaciones para plataformas múltiples",
  ],
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
    description:
      "imSoft: Desarrollo de software, SEO, sitio web, ecommerce, aplicaciones web, consultoria en Guadalajara, Jalisco, México",
    type: "website",
    url: "https://www.imsoft.io/",
    siteName: "imSoft",
    images: [
      {
        url: "https://res.cloudinary.com/https-imsoft-io/image/upload/v1706594670/imsoft-images/imsoft/logotipo-imsoft-cuadrado.png",
        width: 783,
        height: 783,
        alt: "imSoft",
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
      { url: "https://res.cloudinary.com/https-imsoft-io/image/upload/v1716786342/imsoft-images/manifest/favicon-imSoft.png" },
      new URL("https://res.cloudinary.com/https-imsoft-io/image/upload/v1716786342/imsoft-images/manifest/favicon-imSoft.png", "https://www.imsoft.io/"),
    ],
    shortcut: ["https://res.cloudinary.com/https-imsoft-io/image/upload/v1716786342/imsoft-images/manifest/favicon-imSoft.png"],
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
    description:
      "imSoft: Desarrollo de software, SEO, sitio web, ecommerce, aplicaciones web, consultoria en Guadalajara, Jalisco, México",
    creator: "@weareimsoft",
    images: {
      url: "https://res.cloudinary.com/https-imsoft-io/image/upload/v1706594670/imsoft-images/imsoft/logotipo-imsoft-cuadrado.png",
      alt: "imSoft Logo",
    },
  },
  category: "technology",
};

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
