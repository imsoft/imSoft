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
  title: "Tienda en línea",
  description:
    "Si estás buscando expandir tu negocio y llevar tus productos o servicios a una audiencia más amplia, una tienda en línea es una excelente opción. Si estás listo para llevar tu negocio al siguiente nivel, no dudes en contactarme y solicitar una cotización. Estoy seguro de que podemos ayudarte a alcanzar tus objetivos y a tener éxito en el mundo de las tiendas en línea",
  keywords: ["imSoft", "Tienda en línea"],
  twitter: {
    title: "Tienda en línea",
    description:
      "Si estás buscando expandir tu negocio y llevar tus productos o servicios a una audiencia más amplia, una tienda en línea es una excelente opción. Si estás listo para llevar tu negocio al siguiente nivel, no dudes en contactarme y solicitar una cotización. Estoy seguro de que podemos ayudarte a alcanzar tus objetivos y a tener éxito en el mundo de las Tienda en línea",
  },
  openGraph: {
    title: "Tienda en línea",
    description:
      "Si estás buscando expandir tu negocio y llevar tus productos o servicios a una audiencia más amplia, una tienda en línea es una excelente opción. Si estás listo para llevar tu negocio al siguiente nivel, no dudes en contactarme y solicitar una cotización. Estoy seguro de que podemos ayudarte a alcanzar tus objetivos y a tener éxito en el mundo de las Tienda en línea",
  },
};

const introductorySectionInfo: IIntroductorySection = {
  title: "Tienda en línea",
  description: "Vender en línea es como tener una sucursal 24/7",
};

const featuresSectionInfo: IFeaturesSection = {
  topic: "Tienda en línea",
  title: "Caracteristicas del servicio",
  description:
    "Tu empresa tiene que modernizarse con una tienda en línea para poder llegar a clientes de todas partes, al alcance de un solo clic",
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
  topic: "Tienda en línea",
  description:
    "Una tienda en línea escalable es la mejor inversión para tu negocio en línea",
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
  topic: "Tienda en línea",
  title: "Tu tienda en línea hecha a medida",
  description:
    "Si estás buscando expandir tu negocio y llevar tus productos o servicios a una audiencia más amplia, una tienda en línea es una excelente opción. Si estás listo para llevar tu negocio al siguiente nivel, no dudes en contactarme y solicitar una cotización. Estoy seguro de que podemos ayudarte a alcanzar tus objetivos y a tener éxito en el mundo de las tiendas en línea.",
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
