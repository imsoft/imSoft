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
  title: "SEO",
  description:
    "Si quieres que tu negocio tenga éxito en línea, es esencial que tenga una buena presencia en los resultados de búsqueda de Google. El posicionamiento SEO no es algo que se logre de la noche a la mañana, sino que requiere de una estrategia bien planificada y de técnicas especializadas. Es aquí donde entran mis servicios de desarrollo de posicionamiento SEO. Si quieres que tu negocio alcance nuevos clientes y aumente sus ventas en línea, no dudes en contactarme y solicitar una cotización. Estoy seguro de que podemos ayudarte a alcanzar tus objetivos y a tener éxito en el mundo digital",
  keywords: [
    "imSoft",
    "SEO",
    "Posicionamiento SEO",
    "Análisis de palabras clave",
  ],
  twitter: {
    title: "SEO",
    description:
      "Si quieres que tu negocio tenga éxito en línea, es esencial que tenga una buena presencia en los resultados de búsqueda de Google. El posicionamiento SEO no es algo que se logre de la noche a la mañana, sino que requiere de una estrategia bien planificada y de técnicas especializadas. Es aquí donde entran mis servicios de desarrollo de posicionamiento SEO. Si quieres que tu negocio alcance nuevos clientes y aumente sus ventas en línea, no dudes en contactarme y solicitar una cotización. Estoy seguro de que podemos ayudarte a alcanzar tus objetivos y a tener éxito en el mundo digital",
  },
  openGraph: {
    title: "SEO",
    description:
      "Si quieres que tu negocio tenga éxito en línea, es esencial que tenga una buena presencia en los resultados de búsqueda de Google. El posicionamiento SEO no es algo que se logre de la noche a la mañana, sino que requiere de una estrategia bien planificada y de técnicas especializadas. Es aquí donde entran mis servicios de desarrollo de posicionamiento SEO. Si quieres que tu negocio alcance nuevos clientes y aumente sus ventas en línea, no dudes en contactarme y solicitar una cotización. Estoy seguro de que podemos ayudarte a alcanzar tus objetivos y a tener éxito en el mundo digital",
  },
};

const introductorySectionInfo: IIntroductorySection = {
  title: "Posicionamiento SEO",
  description: "Lleguemos juntos a las primeras posiciones de Google",
};

const featuresSectionInfo: IFeaturesSection = {
  topic: "Posicionamiento SEO",
  title: "Caracteristicas del servicio",
  description:
    "Las personas únicamente les hace caso a los primeros enlaces de Google",
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
  topic: "Posicionamiento SEO",
  description: "Lleguemos juntos a las primeras posiciones de Google",
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
  topic: "Posicionamiento SEO",
  title: "Llevamos tu negocio al top de Google",
  description:
    "Si quieres que tu negocio tenga éxito en línea, es esencial que tenga una buena presencia en los resultados de búsqueda de Google. El posicionamiento SEO no es algo que se logre de la noche a la mañana, sino que requiere de una estrategia bien planificada y de técnicas especializadas. Es aquí donde entran mis servicios de desarrollo de posicionamiento SEO. Si quieres que tu negocio alcance nuevos clientes y aumente sus ventas en línea, no dudes en contactarme y solicitar una cotización. Estoy seguro de que podemos ayudarte a alcanzar tus objetivos y a tener éxito en el mundo digital.",
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
