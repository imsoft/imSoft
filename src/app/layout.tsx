import { ConversionBar, Footer, Header } from "@/components/ui/shared";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"] });

interface Props {
  children: React.ReactNode;
}

export const metadata = {
  title: {
    template: "%s | imSoft",
    default: "imSoft",
  },
  description:
    "Empresa de desarrollo de software en Guadalajara, Jalisco, México",

  generator: "imSoft",
  applicationName: "imSoft",
  referrer: "origin-when-cross-origin",
  keywords: ["imSoft", "Sitio web", "Pagina web"],
  authors: [
    { name: "Brandon Uriel Garcia Ramos", url: "https://www.imsoft.io/" },
  ],
  colorScheme: "dark",
  creator: "Brandon Uriel Garcia Ramos",
  publisher: "Brandon Uriel Garcia Ramos",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
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
      "Empresa de desarrollo de software en Guadalajara, Jalisco, México",
    url: "https://www.imsoft.io/",
    siteName: "imSoft",
    images: [
      {
        url: "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/imsoft/logotipo-imsoft-cuadrado.png",
        width: 800,
        height: 600,
        alt: "My custom alt",
      },
      {
        url: "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/imsoft/logotipo-imsoft-cuadrado.png",
        width: 1800,
        height: 1600,
        alt: "My custom alt",
      },
    ],
    locale: "es_MX",
    type: "website", //or article
    publishedTime: "2023-01-01T00:00:00.000Z",
    authors: ["Brandon Uriel Garcia Ramos"],
  },

  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: [{ url: "/icon.png" }, new URL("/icon.png", "https://example.com")],
    shortcut: ["/shortcut-icon.png"],
    apple: [
      { url: "/apple-icon.png" },
      { url: "/apple-icon-x3.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/apple-touch-icon-precomposed.png",
      },
    ],
  },

  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1B9CD9' },
    { media: '(prefers-color-scheme: dark)', color: '#1B9CD9' },
  ],

  manifest: 'https://www.imsoft.io/manifest.json',

  twitter: {
    card: 'app',
    title: 'Next.js',
    description: 'The React Framework for the Web',
    siteId: '1467726470533754880',
    creator: '@nextjs',
    creatorId: '1467726470533754880',
    images: {
      url: 'https://nextjs.org/og.png',
      alt: 'Next.js Logo',
    },
    app: {
      name: 'twitter_app',
      id: {
        iphone: 'twitter_app://iphone',
        ipad: 'twitter_app://ipad',
        googleplay: 'twitter_app://googleplay',
      },
      url: {
        iphone: 'https://iphone_url',
        ipad: 'https://ipad_url',
      },
    },
  },

  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },

  itunes: {
    appId: 'myAppStoreID',
    appArgument: 'myAppArgument',
  },
  appleWebApp: {
    title: 'Apple Web App',
    statusBarStyle: 'black-translucent',
    startupImage: [
      '/assets/startup/apple-touch-startup-image-768x1004.png',
      {
        url: '/assets/startup/apple-touch-startup-image-1536x2008.png',
        media: '(device-width: 768px) and (device-height: 1024px)',
      },
    ],
  },

  category: 'technology',

};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="es">
      <body className={montserrat.className}>
        <header className="sticky top-0 z-50">
          <ConversionBar />
          <Header />
        </header>
        {children}
        <Footer />
      </body>
    </html>
  );
}
