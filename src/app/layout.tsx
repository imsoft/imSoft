import { ConversionBar, Footer, Header, WhatsappButton } from "@/components/ui/shared";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Metadata, Viewport } from "next";
import { GoogleTagManager } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";

const montserrat = Montserrat({ subsets: ["latin"] });

interface Props {
  children: React.ReactNode;
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
    // publishedTime: "2023-01-01T00:00:00.000Z",
    // authors: ["Seb", "Josh"],
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
      { url: "/favicon-imSoft.png" },
      new URL("/favicon-imSoft.png", "https://www.imsoft.io/"),
    ],
    shortcut: ["/favicon-imSoft.png"],
    apple: [
      { url: "/apple-icon-57x57", sizes: "57x57", type: "image/png" },
      { url: "/apple-icon-60x60", sizes: "60x60", type: "image/png" },
      { url: "/apple-icon-72x72", sizes: "72x72", type: "image/png" },
      { url: "/apple-icon-76x76", sizes: "76x76", type: "image/png" },
      { url: "/apple-icon-114x114", sizes: "114x114", type: "image/png" },
      { url: "/apple-icon-120x120", sizes: "120x120", type: "image/png" },
      { url: "/apple-icon-144x144", sizes: "144x144", type: "image/png" },
      { url: "/apple-icon-152x152", sizes: "152x152", type: "image/png" },
      { url: "/apple-icon-180x180", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "android-icon-192x192",
        url: "/android-icon-192x192.png",
      },
      {
        rel: "favicon-16x16",
        url: "/favicon-16x16.png",
      },
      {
        rel: "favicon-32x32",
        url: "/favicon-32x32.png",
      },
      {
        rel: "favicon-96x96",
        url: "/favicon-96x96.png",
      },
      {
        rel: "favicon-imSoft",
        url: "/favicon-imSoft.png",
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
    // siteId: '1467726470533754880',
    // creatorId: '1467726470533754880',
    images: {
      url: "https://res.cloudinary.com/https-imsoft-io/image/upload/v1706594670/imsoft-images/imsoft/logotipo-imsoft-cuadrado.png",
      alt: "imSoft Logo",
    },
  },
  category: "technology",
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="es" className={montserrat.className}>
      <body>
        <header className="sticky top-0 z-50">
          <ConversionBar />
          <Header />
        </header>
        {children}
        <WhatsappButton />
        <Footer />
        
        <GoogleTagManager gtmId={"G-F34MP2JXNX"} />
        <GoogleTagManager gtmId={"GTM-PXS9JKGT"} />
        <SpeedInsights />
      </body>
    </html>
  );
}
