import { Metadata } from "next";
import {
  IntroductorySection,
  FeaturesSection,
  PricesSection,
  CallToActionSection,
} from "@/components/ui/services";
import {
  IIntroductorySection,
  IFeaturesSection,
  IPricesSection,
  ICallToActionSection,
} from "@/interfaces";
import {
  UserGroupIcon,
  ClockIcon,
  PresentationChartBarIcon,
  ArrowUpIcon,
  ArrowTrendingUpIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Tienda en Línea en Tlaquepaque | imSoft",
  description:
    "Crea y expande tu tienda en línea en Tlaquepaque con imSoft. Ofrecemos soluciones personalizadas para llevar tu negocio al éxito digital.",
  keywords: [
    "imSoft",
    "Tienda en línea",
    "Tienda en línea Tlaquepaque",
    "Comercio Electrónico Tlaquepaque",
  ],
  twitter: {
    title: "Tienda en Línea en Tlaquepaque - imSoft",
    description:
      "Descubre cómo imSoft puede transformar tu negocio en Tlaquepaque con una tienda en línea personalizada. Estamos listos para llevar tu negocio al siguiente nivel en el mundo del comercio electrónico.",
  },
  openGraph: {
    title: "Tienda en Línea Personalizada en Tlaquepaque | imSoft",
    description:
      "En imSoft, somos expertos en crear tiendas en línea que se destacan en Tlaquepaque. Contacta para una solución a medida y lleva tu negocio a nuevos horizontes digitales.",
  },
};

const introductorySectionInfo: IIntroductorySection = {
  title: "Expande tu Negocio en Tlaquepaque con Nuestra Tienda en Línea",
  description:
    "Una tienda en línea es tu sucursal abierta 24/7 en Tlaquepaque y más allá. Descubre el poder del comercio electrónico con imSoft.",
};

const featuresSectionInfo: IFeaturesSection = {
  topic: "Tienda en Línea para Tlaquepaque",
  title: "Características de Nuestra Tienda en Línea",
  description:
    "Adapta tu empresa a la era digital con una tienda en línea diseñada para el mercado de Tlaquepaque, ofreciendo accesibilidad y crecimiento global.",
  serviceFeatures: [
    {
      title: "Generación de competitividad",
      description:
        "Al tener una tienda en línea ya estarás un paso delante de tu competencia.",
      icon: UserGroupIcon,
    },
    {
      title: "Atiende 24/7",
      description:
        "Recuerda, las tiendas en línea no cierran y todo esta al alcance de un clic.",
      icon: ClockIcon,
    },
    {
      title: "Genera más ventas",
      description: "Lleva a la gente a tu sitio web para generar ventas.",
      icon: PresentationChartBarIcon,
    },
    {
      title: "Potencia tus redes sociales",
      description:
        "Al llegar a tu tienda en línea, las personas te querrán conocer más.",
      icon: ArrowUpIcon,
    },
    {
      title: "Escalabilidad",
      description:
        "Elige un ecommerce escalable para un crecimiento sin límites.",
      icon: ArrowTrendingUpIcon,
    },
    {
      title: "Compra fácil",
      description:
        "A tus clientes no les costara llegar al paso final, que es la compra.",
      icon: ShoppingBagIcon,
    },
  ],
};

const pricesSectionInfo: IPricesSection = {
  topic: "Soluciones de Tienda en Línea para Tlaquepaque",
  description:
    "Ofrecemos paquetes de tienda en línea escalables y asequibles, ideales para negocios emergentes y establecidos en Tlaquepaque.",
  listOfPackages: [
    {
      title: "Paquete de Tienda en línea #1",
      description:
        "Con una tienda en línea escalable, tu tienda en línea está preparada para el futuro.",
      featuresOfPackage: [
        "Hasta cuatro páginas",
        "Hasta tres productos",
        "Adaptación de dispositivos móviles",
        "Formulario de contacto",
        "Mapa de ubicación",
        "Enlaces a redes sociales",
        "Enlace a número de WhatsApp",
        "Dos Correos electrónicos",
        "Certificado de seguridad",
        "Un solo idioma",
        "Dominio",
        "Hosting",
        "Alta en Google negocios",
      ],
      price: "9,999",
    },
    {
      title: "Paquete de Tienda en línea #2",
      description:
        "Nuestro equipo de desarrolladores de ecommerce te llevará al éxito.",
      featuresOfPackage: [
        "Hasta seis páginas",
        "Hasta cinco productos",
        "Adaptación de dispositivos móviles",
        "Formulario de contacto",
        "Mapa de ubicación",
        "Enlaces a redes sociales",
        "Enlace a número de WhatsApp",
        "Cuatro Correos electrónicos",
        "Certificado de seguridad",
        "Un solo idioma",
        "Dominio",
        "Hosting",
        "SEO básico",
        "Alta en Google negocios",
      ],
      price: "12,999",
    },
    {
      title: "Paquete de Tienda en línea #3",
      description:
        "Hacemos que tus compras en línea sean fáciles y seguras para tus clientes.",
      featuresOfPackage: [
        "Hasta ocho páginas",
        "Hasta siete productos",
        "Adaptación de dispositivos móviles",
        "Formulario de contacto",
        "Mapa de ubicación",
        "Enlaces a redes sociales",
        "Enlace a número de WhatsApp",
        "Seis Correos electrónicos",
        "Certificado de seguridad",
        "Un solo idioma",
        "Escaneo de amenazas “SG Site Scanner”",
        "Dominio",
        "Hosting",
        "SEO básico",
        "Generación de código de Google Analytics",
        "Alta en Google negocios",
      ],
      price: "15,999",
    },
  ],
};

const callToActionSectionInfo: ICallToActionSection = {
  image:
    "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/services/tienda-en-linea-imsoft.jpg",
  topic: "Crea tu Tienda en Línea en Tlaquepaque",
  title: "Lanza tu Tienda Online con imSoft",
  description:
    "Únete al mundo digital en Tlaquepaque con una tienda en línea personalizada de imSoft. Contacta ahora y da el primer paso hacia el éxito en comercio electrónico.",
};

const EcommercePage = () => {
  return (
    <>
      <main>
        <IntroductorySection
          title={introductorySectionInfo.title}
          description={introductorySectionInfo.description}
        />

        <FeaturesSection
          topic={featuresSectionInfo.topic}
          title={featuresSectionInfo.title}
          description={featuresSectionInfo.description}
          serviceFeatures={featuresSectionInfo.serviceFeatures}
        />

        <PricesSection
          topic={pricesSectionInfo.topic}
          description={pricesSectionInfo.description}
          listOfPackages={pricesSectionInfo.listOfPackages}
        />

        <CallToActionSection
          image={callToActionSectionInfo.image}
          topic={callToActionSectionInfo.topic}
          title={callToActionSectionInfo.title}
          description={callToActionSectionInfo.description}
        />
      </main>
    </>
  );
};

export default EcommercePage;
