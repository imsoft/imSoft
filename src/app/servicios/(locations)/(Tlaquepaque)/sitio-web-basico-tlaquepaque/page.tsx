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
  title: "Sitio Web Básico en Tlaquepaque | imSoft",
  description:
    "Ofrecemos soluciones de sitios web básicos en Tlaquepaque, perfectos para pequeños negocios o emprendedores que buscan una presencia online efectiva.",
  keywords: [
    "imSoft",
    "Sitio web Básico",
    "Sitio web Tlaquepaque",
    "Web design Tlaquepaque",
  ],
  twitter: {
    title: "Sitio Web Básico en Tlaquepaque | imSoft",
    description:
      "Descubre nuestro servicio de creación de sitios web básicos en Tlaquepaque. Diseños atractivos y funcionales adaptados a tus necesidades empresariales.",
  },
  openGraph: {
    title: "Desarrollo de Sitio Web Básico en Tlaquepaque | imSoft",
    description:
      "Inicia tu presencia online en Tlaquepaque con un sitio web básico de imSoft. Soluciones personalizadas para cada negocio o proyecto.",
  },
};

const introductorySectionInfo: IIntroductorySection = {
  title: "Desarrollo de Sitio Web Básico en Tlaquepaque",
  description:
    "Comienza tu viaje digital en Tlaquepaque con un sitio web básico. Perfecto para emprendedores y pequeños negocios que quieren marcar la diferencia online.",
};

const featuresSectionInfo: IFeaturesSection = {
  topic: "Sitio Web Básico para Tlaquepaque",
  title: "Características de Nuestros Sitios Web Básicos",
  description:
    "Nuestros sitios web básicos están diseñados para brindar una presencia online efectiva y asequible para negocios en Tlaquepaque.",
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
  topic: "Paquetes de Sitio Web Básico para Negocios en Tlaquepaque",
  description:
    "Explora nuestros paquetes asequibles para sitios web básicos, ideales para iniciar tu presencia digital en Tlaquepaque.",
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
  topic: "Sitio Web Básico en Tlaquepaque",
  title: "Inicia tu Presencia Online con un Sitio Web Básico",
  description:
    "Lanza tu negocio en Tlaquepaque con un sitio web básico de imSoft. Contáctanos para soluciones web atractivas, funcionales y adaptadas a tus necesidades.",
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
