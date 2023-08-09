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
  ComputerDesktopIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  WrenchScrewdriverIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const index = () => {
  const introductorySectionInfo: IIntroductorySection = {
    title: "Sitio Web Jr",
    description:
      "Un sitio web es la clave del éxito en línea: ¡deja que te ayudemos a tener uno!",
  };

  const featuresSectionInfo: IFeaturesSection = {
    topic: "Sitio Web Jr",
    title: "Caracteristicas del servicio",
    description:
      "¿Quieres destacarte en línea? ¡Permítenos crear tu sitio web!",
    serviceFeatures: [
      {
        title: "Diseño personalizado",
        description:
          "Creemos un sitio web profesional que se adapte a las necesidades y estilo de cada cliente.",
        icon: ComputerDesktopIcon,
      },
      {
        title: "Integración de redes sociales",
        description:
          "Permitir que los visitantes del sitio web compartan fácilmente el contenido en las redes sociales.",
        icon: CurrencyDollarIcon,
      },
      {
        title: "Sitio web responsivo",
        description:
          "Nos aseguramos de que el sitio web se vea y funcione bien en los diferentes dispositivos electrónicos.",
        icon: GlobeAltIcon,
      },
      {
        title: "Formularios de contacto",
        description:
          "Permitir que los visitantes del sitio web se comuniquen fácilmente con el cliente a través de formularios de contacto.",
        icon: WrenchScrewdriverIcon,
      },
      {
        title: "Seguridad y protección",
        description:
          "Asegurarse de que el sitio web sea seguro y esté protegido contra posibles amenazas y ataques cibernéticos.",
        icon: ArrowTrendingUpIcon,
      },
      {
        title: "Hosting y dominio",
        description:
          "Proporcionar el espacio de alojamiento y el nombre de dominio para el sitio web, para que tus clientes tengan a donde llegar.",
        icon: MagnifyingGlassIcon,
      },
    ],
  };

  const pricesSectionInfo: IPricesSection = {
    topic: "Sitio Web Jr",
    description:
      "Llegó la hora de tener tu propio espacio en la web: ¡contáctanos ahora mismo!",
    listOfPackages: [
      {
        title: "Paquete de Sitio Web Jr #1",
        description:
          "Un sitio web es la mejor inversión para tu negocio: ¡permítenos ayudarte a tener uno!.",
        featuresOfPackage: [
          "Hasta una página",
          "Adaptación de dispositivos móviles",
          "Formulario de contacto",
          "Mapa de ubicación",
          "Enlaces a redes sociales",
          "Enlace a número de WhatsApp",
          "Un Correo electrónico",
          "Certificado de seguridad",
          "Un solo idioma",
          "Dominio",
          "Hosting",
        ],
        price: "5,999",
      },
    ],
  };

  const callToActionSectionInfo: ICallToActionSection = {
    image:
      "https://firebasestorage.googleapis.com/v0/b/imsoft-website.appspot.com/o/Servicios%2FSitio%20web%20jr-imSoft.jpg?alt=media&token=b9722728-f180-405c-8256-d4f60d9d8493",
    topic: "Sitio Web Jr",
    title:
      "Haz que tu negocio sea accesible en línea: ¡permítenos crear tu sitio web!",
    description:
      "En nuestro servicio de creación de sitios web, nos aseguramos de proporcionar una solución completa y personalizada para cada uno de nuestros clientes. Diseñamos sitios web atractivos y funcionales que se adaptan a las necesidades de cada negocio o proyecto.",
  };

  const metatagsInfo: RequiredMetatags = {
    title: "Sitio Web Jr | imSoft",
    description: "En nuestro servicio de creación de sitios web, nos aseguramos de proporcionar una solución completa y personalizada para cada uno de nuestros clientes. Diseñamos sitios web atractivos y funcionales que se adaptan a las necesidades de cada negocio o proyecto.",
    keywords: "Sitio Web Jr, imSoft",
    author: "Brandon Uriel García Ramos",
    subject: "Sitio Web Jr",
    date: dateMetatagInfo,
    type: "Sitio Web Jr",
    source: "https://www.imsoft.io/sitio-web-jr",
    image: "https://firebasestorage.googleapis.com/v0/b/imsoft-website.appspot.com/o/Servicios%2FSitio%20web%20jr-imSoft.jpg?alt=media&token=b9722728-f180-405c-8256-d4f60d9d8493",
    url: "https://www.imsoft.io/sitio-web-jr",
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
