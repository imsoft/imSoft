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
  BoltIcon,
  PencilSquareIcon,
  MagnifyingGlassCircleIcon,
  ArrowTrendingUpIcon,
  PencilIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Sitio Web Pro en Guadalajara | imSoft",
  description:
    "Desarrollamos sitios web Pro en Guadalajara, utilizando tecnología de vanguardia para crear soluciones web que impulsen tu negocio.",
  keywords: ["imSoft", "Sitio web Pro", "Desarrollo web avanzado Guadalajara"],
  twitter: {
    title: "Sitio Web Pro en Guadalajara | imSoft",
    description:
      "Lleva tu negocio en Guadalajara a la vanguardia digital con nuestro servicio de Sitio Web Pro. Tecnología avanzada para un rendimiento superior.",
  },
  openGraph: {
    title: "Desarrollo de Sitio Web Pro en Guadalajara | imSoft",
    description:
      "En imSoft, creamos sitios web Pro para negocios en Guadalajara que buscan excelencia y rendimiento en el mundo digital.",
  },
};

const introductorySectionInfo: IIntroductorySection = {
  title: "Servicio de Sitio Web Pro en Guadalajara",
  description:
    "Utilizamos las mejores tecnologías para llevar tu empresa en Guadalajara al siguiente nivel. Un sitio web Pro significa más potencia, más velocidad y un diseño superior.",
};

const featuresSectionInfo: IFeaturesSection = {
  topic: "Sitio Web Pro para Negocios en Guadalajara",
  title: "Características Avanzadas de Nuestros Sitios Web Pro",
  description:
    "Nuestros sitios web Pro están diseñados para empresas en Guadalajara que buscan un rendimiento y una presencia online de primer nivel.",
  serviceFeatures: [
    {
      title: "Sitio Web Ultra Rápido",
      description:
        "Con este servicio la velocidad de tu sitio web cambiara drásticamente y así tener una mejor retención del usuario.",
      icon: BoltIcon,
    },
    {
      title: "Personalizable",
      description:
        "Este servicio te ayudara a aterrizar tus ideas para que tus clientes tengan una mejor experiencia de usuario.",
      icon: PencilSquareIcon,
    },
    {
      title: "SEO Friendly",
      description:
        "El SEO es fundamental para las empresas que buscan ser encontradas, y por eso esta tecnología es la mejor para ti.",
      icon: MagnifyingGlassCircleIcon,
    },
    {
      title: "De las tecnologías web más populares",
      description:
        "Las mejores empresas utilizan Next.js porque saben el poder y los resultados a los que se pueden llegar.",
      icon: ArrowTrendingUpIcon,
    },
    {
      title: "Rápido de trabajar",
      description:
        "Cada empresa es diferente y con ello llegan muchas ideas, te ayudaremos a plasmar esas ideas de manera fácil y rápida.",
      icon: PencilIcon,
    },
    {
      title: "Sitio web ligero",
      description:
        "Google se fija mucho en la velocidad y peso de los sitios web, por eso esta es la mejor opción para ti.",
      icon: ComputerDesktopIcon,
    },
  ],
};

const pricesSectionInfo: IPricesSection = {
  topic: "Paquetes de Sitio Web Pro para Guadalajara",
  description:
    "Descubre nuestros paquetes de Sitio Web Pro, diseñados para satisfacer las necesidades de negocios dinámicos y ambiciosos en Guadalajara.",
  listOfPackages: [
    {
      title: "Paquete de Sitio Web Pro #1",
      description: "Te acompañamos en el crecimiento de tu negocio en línea.",
      featuresOfPackage: [
        "Hasta cuatro páginas",
        "Adaptación de dispositivos móviles",
        "Formulario de contacto",
        "Mapa de ubicación",
        "Enlaces a redes sociales",
        "Enlace a número de WhatsApp",
        "Certificado de seguridad",
        "Un solo idioma",
        "Dominio",
        "Hosting",
        "Alta en Google negocios",
      ],
      price: "13,999",
    },
    {
      title: "Paquete de Sitio Web Pro #2",
      description: "Soluciones web personalizadas y a medida para tu negocio.",
      featuresOfPackage: [
        "Hasta seis páginas",
        "Adaptación de dispositivos móviles",
        "Formulario de contacto",
        "Mapa de ubicación",
        "Enlaces a redes sociales",
        "Enlace a número de WhatsApp",
        "Certificado de seguridad",
        "Un solo idioma",
        "Dominio",
        "Hosting",
        "SEO básico",
        "Alta en Google negocios",
      ],
      price: "15,999",
    },
    {
      title: "Paquete de Sitio Web Pro #3",
      description: "Sitios web de alta calidad y diseño atractivo.",
      featuresOfPackage: [
        "Hasta ocho páginas",
        "Adaptación de dispositivos móviles",
        "Formulario de contacto",
        "Mapa de ubicación",
        "Enlaces a redes sociales",
        "Enlace a número de WhatsApp",
        "Certificado de seguridad",
        "Un solo idioma",
        "Dominio",
        "Hosting",
        "SEO básico",
        "Generación de código de Google Analytics",
        "Alta en Google negocios",
      ],
      price: "17,999",
    },
  ],
};

const callToActionSectionInfo: ICallToActionSection = {
  image:
    "https://res.cloudinary.com/https-imsoft-io/image/upload/v1706595027/imsoft-images/services/sitio-web-pro-imsoft.jpg",
  topic: "Sitio Web Pro en Guadalajara",
  title: "Eleva tu Negocio en Guadalajara con un Sitio Web Pro",
  description:
    "Descubre el poder de un Sitio Web Pro con imSoft en Guadalajara. Contacta con nosotros para soluciones web que transformen tu presencia digital.",
};

const WebPagePro = () => {
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

export default WebPagePro;
