import { Metadata } from "next";
import {
  IntroductorySection,
  FeaturesSection,
  MonthlyPaymentSection,
  CallToActionSection,
} from "@/components/ui/services";
import {
  IIntroductorySection,
  IFeaturesSection,
  IPricesSection,
  ICallToActionSection,
} from "@/interfaces";
import {
  EyeIcon,
  BuildingStorefrontIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  PencilSquareIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Servicios de SEO en Guadalajara | imSoft",
  description:
    "Optimiza tu presencia online en Guadalajara con nuestros servicios de SEO. Estrategias personalizadas para impulsar tu negocio en los resultados de búsqueda de Google.",
  keywords: [
    "imSoft",
    "SEO Guadalajara",
    "Posicionamiento SEO Guadalajara",
    "Servicios SEO Guadalajara",
    "Análisis de palabras clave",
  ],
  twitter: {
    title: "SEO en Guadalajara | imSoft",
    description:
      "Aumenta la visibilidad de tu negocio en Guadalajara con nuestro SEO especializado. Estrategias y técnicas para dominar los resultados de Google.",
  },
  openGraph: {
    title: "Optimización SEO en Guadalajara | imSoft",
    description:
      "Con nuestros servicios de SEO en Guadalajara, tu negocio alcanzará nuevas alturas en el mundo digital. Contáctanos para mejorar tu ranking en Google.",
  },
};

const introductorySectionInfo: IIntroductorySection = {
  title: "Expertos en SEO en Guadalajara",
  description:
    "Lleguemos juntos a las primeras posiciones de Google y eleva tu negocio en Guadalajara con nuestro SEO avanzado y personalizado.",
};

const featuresSectionInfo: IFeaturesSection = {
  topic: "SEO Avanzado en Guadalajara",
  title: "Cómo Potenciamos tu Negocio con SEO",
  description:
    "Maximiza tu presencia online en Guadalajara con nuestro servicio de SEO. Descubre cómo podemos llevar tu negocio al top de Google.",
  serviceFeatures: [
    {
      title: "Análisis de palabras clave",
      description:
        "Conoceremos tu negocio y la palabra clave con la que te quieres dar a conocer.",
      icon: EyeIcon,
    },
    {
      title: "Análisis del mercado",
      description:
        "Analizaremos a tu publico objetivo para adaptarnos a lo que ellos buscan.",
      icon: BuildingStorefrontIcon,
    },
    {
      title: "Análisis de la competencia",
      description:
        "Conoceremos a tu competencia y superaremos sus estrategias.",
      icon: UserGroupIcon,
    },
    {
      title: "Mantenimiento al sitio web",
      description:
        "Detectaremos fallos en tu web actual y daremos las mejores soluciones.",
      icon: WrenchScrewdriverIcon,
    },
    {
      title: "Generación de artículos",
      description:
        "El contenido por excelencia en los sitios web son los artículos.",
      icon: PencilSquareIcon,
    },
    {
      title: "Meta etiquetas",
      description: "Le diremos a Google quienes somos y donde queremos estar.",
      icon: TagIcon,
    },
  ],
};

const pricesSectionInfo: IPricesSection = {
  topic: "Precios de Servicios SEO en Guadalajara",
  description:
    "Descubre nuestros paquetes de SEO en Guadalajara y cómo pueden ayudar a tu negocio a crecer en el mundo digital.",
  listOfPackages: [
    {
      title: "Paquete de Posicionamiento SEO",
      description:
        "Con nuestro SEO, tu negocio alcanzará nuevos clientes y más ventas.",
      featuresOfPackage: [
        "Análisis y optimización de la estructura y el contenido del sitio web",
        "Investigación y selección de palabras clave relevantes",
        "Optimización del contenido del sitio web con palabras clave seleccionadas",
        "Generación de enlaces entrantes (backlinks) de calidad",
        "Monitorización y análisis de los resultados del posicionamiento y del tráfico web",
        "Generación de contenido de calidad para el blog del sitio web",
        "Optimización de la experiencia de usuario (UX) y la velocidad de carga del sitio web",
        "Optimización de la presencia del sitio web en las redes sociales y en otros canales en línea",
      ],
      price: "10,000",
    },
  ],
};

const callToActionSectionInfo: ICallToActionSection = {
  image:
    "https://res.cloudinary.com/https-imsoft-io/image/upload/v1706595026/imsoft-images/services/posicionamiento-seo-imsoft.jpg",
  topic: "SEO para tu Negocio en Guadalajara",
  title: "Impulsa tu Presencia Online en Guadalajara",
  description:
    "Con nuestros servicios de SEO en Guadalajara, tu sitio web no solo alcanzará nuevos clientes, sino que también aumentará sus ventas en línea. Contáctanos y comienza a destacar en el mundo digital.",
};

const SEOPage = () => {
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

        <MonthlyPaymentSection
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

export default SEOPage;
