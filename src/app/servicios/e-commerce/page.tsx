import {
  IntroductorySection,
  FeaturesSection,
  PricesSection,
  CallToActionSection,
} from "@/components/ui/services";
import { dateMetatagInfo } from "@/data";
import {
  IIntroductorySection,
  IFeaturesSection,
  IPricesSection,
  ICallToActionSection,
  RequiredMetatags,
} from "@/interfaces";
import {
  UserGroupIcon,
  ClockIcon,
  PresentationChartBarIcon,
  ArrowUpIcon,
  ArrowTrendingUpIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";

const index = () => {
  const introductorySectionInfo: IIntroductorySection = {
    title: "E-Commerce",
    description: "Vender en línea es como tener una sucursal 24/7",
  };

  const featuresSectionInfo: IFeaturesSection = {
    topic: "E-Commerce",
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
    topic: "E-Commerce",
    description:
      "Un e-commerce escalable es la mejor inversión para tu negocio en línea",
    listOfPackages: [
      {
        title: "Paquete de E-Commerce #1",
        description:
          "Con un e-commerce escalable, tu tienda en línea está preparada para el futuro.",
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
        title: "Paquete de E-Commerce #2",
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
        title: "Paquete de E-Commerce #3",
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
      "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/imsoft/logotipo-imsoft-cuadrado.png",
    topic: "E-Commerce",
    title: "Tu tienda en línea hecha a medida",
    description:
      "Si estás buscando expandir tu negocio y llevar tus productos o servicios a una audiencia más amplia, una tienda en línea es una excelente opción. Si estás listo para llevar tu negocio al siguiente nivel, no dudes en contactarme y solicitar una cotización. Estoy seguro de que podemos ayudarte a alcanzar tus objetivos y a tener éxito en el mundo del e-commerce.",
  };

  const metatagsInfo: RequiredMetatags = {
    title: "E-Commerce | imSoft",
    description: "Si estás buscando expandir tu negocio y llevar tus productos o servicios a una audiencia más amplia, una tienda en línea es una excelente opción. Si estás listo para llevar tu negocio al siguiente nivel, no dudes en contactarme y solicitar una cotización. Estoy seguro de que podemos ayudarte a alcanzar tus objetivos y a tener éxito en el mundo del e-commerce",
    keywords: "Tienda en linea, E-Commerce, imSoft",
    author: "Brandon Uriel García Ramos",
    subject: "E-Commerce",
    date: dateMetatagInfo,
    type: "E-Commerce",
    source: "https://www.imsoft.io/e-commerce",
    image: "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/imsoft/logotipo-imsoft-cuadrado.png",
    url: "https://www.imsoft.io/e-commerce",
    robots: "index,follow",
    _id: "",
    tags: []
  };

  return (
    <>
      {/* MetaEtiquetas Básicas */}
      <title>{metatagsInfo.title}</title>
      <meta name="title" content={metatagsInfo.title} />
      <meta httpEquiv="title" content={metatagsInfo.title} />
      <meta name="description" lang="es" content={metatagsInfo.description} />
      <meta name="keywords" lang="es" content={metatagsInfo.keywords} />
      <meta name="date" content={metatagsInfo.date} />

      {/* Informacion del autor */}
      <meta name="author" content={metatagsInfo.author} />

      {/* Dublincore */}
      <meta name="DC.title" lang="es-MX" content={metatagsInfo.title} />
      <meta name="DC.creator" lang="es-MX" content={metatagsInfo.author} />
      <meta name="DC.subject" lang="es-MX" content={metatagsInfo.subject} />
      <meta
        name="DC.description"
        lang="es-MX"
        content={metatagsInfo.description}
      />
      <meta name="DC.publisher" lang="es-MX" content={metatagsInfo.author} />
      <meta name="DC.date" lang="es-MX" content={metatagsInfo.date} />
      <meta name="DC.type" lang="es-MX" content={metatagsInfo.type} />
      <meta name="DC.identifier" lang="es-MX" content={metatagsInfo.title} />
      <meta name="DC.source" lang="es-MX" content={metatagsInfo.source} />
      <meta name="DC.relation" lang="es-MX" content={metatagsInfo.source} />

      {/* Twitter */}
      <meta name="twitter:title" content={metatagsInfo.title} />
      <meta name="twitter:description" content={metatagsInfo.description} />
      <meta name="twitter:image:src" content={metatagsInfo.image} />
      <meta name="twitter:image:alt" content={metatagsInfo.title} />

      {/* Facebook */}
      <meta property="og:title" content={metatagsInfo.title} />
      <meta property="og:type" content={metatagsInfo.type} />
      <meta
        property="og:url"
        content={`https://www.imsoft.io${metatagsInfo.url}`}
      />
      <meta property="og:image" content={metatagsInfo.image} />
      <meta property="og:description" content={metatagsInfo.description} />

      {/* Google + / Pinterest */}
      <meta itemProp="description" content={metatagsInfo.description} />
      <meta itemProp="image" content={metatagsInfo.image} />

      {/* Robots */}
      <meta name="robots" content={metatagsInfo.robots} />

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

export default index;
