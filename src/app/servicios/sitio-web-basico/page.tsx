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
  ComputerDesktopIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  WrenchScrewdriverIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Sitio Web Básico",
  description:
    "En nuestro servicio de creación de sitios web, nos aseguramos de proporcionar una solución completa y personalizada para cada uno de nuestros clientes. Diseñamos sitios web atractivos y funcionales que se adaptan a las necesidades de cada negocio o proyecto.",
  keywords: ["imSoft", "Sitio web Básico"],
  twitter: {
    title: "Sitio Web Básico",
    description:
      "En nuestro servicio de creación de sitios web, nos aseguramos de proporcionar una solución completa y personalizada para cada uno de nuestros clientes. Diseñamos sitios web atractivos y funcionales que se adaptan a las necesidades de cada negocio o proyecto.",
  },
  openGraph: {
    title: "Sitio Web Básico",
    description:
      "En nuestro servicio de creación de sitios web, nos aseguramos de proporcionar una solución completa y personalizada para cada uno de nuestros clientes. Diseñamos sitios web atractivos y funcionales que se adaptan a las necesidades de cada negocio o proyecto.",
  },
};

const introductorySectionInfo: IIntroductorySection = {
  title: "Sitio Web Básico",
  description:
    "Un sitio web es la clave del éxito en línea: ¡deja que te ayudemos a tener uno!",
};

const featuresSectionInfo: IFeaturesSection = {
  topic: "Sitio Web Básico",
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
  topic: "Sitio Web Básico",
  description:
    "Llegó la hora de tener tu propio espacio en la web: ¡contáctanos ahora mismo!",
  listOfPackages: [
    {
      title: "Paquete de Sitio Web Básico #1",
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
    "https://res.cloudinary.com/https-imsoft-io/image/upload/v1706595026/imsoft-images/services/sitio-web-jr-imsoft.jpg",
  topic: "Sitio Web Básico",
  title:
    "Haz que tu negocio sea accesible en línea: ¡permítenos crear tu sitio web!",
  description:
    "En nuestro servicio de creación de sitios web, nos aseguramos de proporcionar una solución completa y personalizada para cada uno de nuestros clientes. Diseñamos sitios web atractivos y funcionales que se adaptan a las necesidades de cada negocio o proyecto.",
};

const WebPageJrPage = () => {
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

export default WebPageJrPage;
