import { Metadata } from "next";
import {
  IntroductorySection,
  FeaturesSection,
  PricesSection,
  CallToActionSection,
} from "@/components/ui/services";
import {
  ICallToActionSection,
  IFeaturesSection,
  IIntroductorySection,
  IPricesSection,
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
  title: "Sitio Web",
  description:
    "Si quieres que tu negocio tenga éxito en línea, es esencial contar con un sitio web atractivo y funcional. Si quieres que tu negocio tenga presencia en línea y alcance nuevos clientes, no dudes en contactarme y solicitar una cotización. Estoy seguro de que podemos ayudarte a alcanzar tus objetivos y a tener éxito en el mundo digital",
  keywords: ["imSoft", "Sitio web"],
  twitter: {
    title: "Sitio Web",
    description:
      "Si quieres que tu negocio tenga éxito en línea, es esencial contar con un sitio web atractivo y funcional. Si quieres que tu negocio tenga presencia en línea y alcance nuevos clientes, no dudes en contactarme y solicitar una cotización. Estoy seguro de que podemos ayudarte a alcanzar tus objetivos y a tener éxito en el mundo digital",
  },
  openGraph: {
    title: "Sitio Web",
    description:
      "Si quieres que tu negocio tenga éxito en línea, es esencial contar con un sitio web atractivo y funcional. Si quieres que tu negocio tenga presencia en línea y alcance nuevos clientes, no dudes en contactarme y solicitar una cotización. Estoy seguro de que podemos ayudarte a alcanzar tus objetivos y a tener éxito en el mundo digital",
  },
};

const introductorySectionInfo: IIntroductorySection = {
  title: "Sitio Web",
  description:
    "Ya disté el primer paso, permítenos acompañarte a dar el siguiente",
};

const featuresSectionInfo: IFeaturesSection = {
  topic: "Sitio Web",
  title: "Caracteristicas del servicio",
  description:
    "Esta opción es excelente para cualquier emprendedor o empresa que quiera tener presencia en la internet, llegar a más clientes y generar más ingresos",
  serviceFeatures: [
    {
      title: "Diseño web amigable",
      description:
        "Recuerda que solo tenemos 10 segundos para llamar la atención de tus futuros clientes.",
      icon: ComputerDesktopIcon,
    },
    {
      title: "Económico",
      description:
        "Wordpress al ser tan amigable y moldeable utilizarlo es una opción muy económica.",
      icon: CurrencyDollarIcon,
    },
    {
      title: "Herramienta popular",
      description:
        "Con solo el 43% del internet wordpress se convierte en una herramienta muy popular.",
      icon: GlobeAltIcon,
    },
    {
      title: "Mantenimiento optimo",
      description:
        "Wordpress es muy amigable para realizar cualquier tipo de mantenimiento o actualizaciones.",
      icon: WrenchScrewdriverIcon,
    },
    {
      title: "Escalabilidad",
      description:
        "Wordpress crece con tu empresa, cada idea que tengas en mente, nosotros la aterrizaremos.",
      icon: ArrowTrendingUpIcon,
    },
    {
      title: "SEO Friendly",
      description:
        "Para llegar a las primeras búsquedas de Google, esta es tu mejor opción.",
      icon: MagnifyingGlassIcon,
    },
  ],
};

const pricesSectionInfo: IPricesSection = {
  topic: "Sitio Web",
  description:
    "Hacemos que tu negocio tenga presencia en línea con nuestros sitios web",
  listOfPackages: [
    {
      title: "Paquete de Sitio Web #1",
      description:
        "Diseñamos y desarrollamos sitios web personalizados a tu medida.",
      featuresOfPackage: [
        "Hasta cuatro páginas",
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
      price: "8,999",
    },
    {
      title: "Paquete de Sitio Web #2",
      description:
        "Brindamos soluciones de desarrollo web profesionales y eficientes.",
      featuresOfPackage: [
        "Hasta seis páginas",
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
      price: "10,999",
    },
    {
      title: "Paquete de Sitio Web #3",
      description:
        "Nuestros sitios web son atractivos, responsivos y fáciles de usar.",
      featuresOfPackage: [
        "Hasta ocho páginas",
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
      price: "12,999",
    },
  ],
};

const callToActionSectionInfo: ICallToActionSection = {
  image:
    "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/services/sitio-web-imsoft.jpg",
  topic: "Sitio Web",
  title:
    "Hacemos que tu negocio tenga presencia en línea con nuestros sitios web",
  description:
    "Si quieres que tu negocio tenga éxito en línea, es esencial contar con un sitio web atractivo y funcional. Si quieres que tu negocio tenga presencia en línea y alcance nuevos clientes, no dudes en contactarme y solicitar una cotización. Estoy seguro de que podemos ayudarte a alcanzar tus objetivos y a tener éxito en el mundo digital.",
};

const WebPagePage = () => {
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

export default WebPagePage;
