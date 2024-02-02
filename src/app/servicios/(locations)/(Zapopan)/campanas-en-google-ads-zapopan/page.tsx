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
  PaintBrushIcon,
  DocumentTextIcon,
  PhotoIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Gestión de Campañas en Google Ads en Zapopan | imSoft",
  description:
    "Optimiza tu inversión publicitaria en Zapopan con nuestras campañas personalizadas de Google Ads. Creamos y gestionamos campañas que mejoran la visibilidad y atraen tráfico de calidad.",
  keywords: [
    "imSoft",
    "Google Ads Zapopan",
    "Campañas PPC Zapopan",
    "Publicidad en línea Zapopan",
    "SEM Zapopan",
  ],
  twitter: {
    title: "Gestión de Campañas en Google Ads",
    description:
      "Maximiza el ROI de tu publicidad en línea con campañas de Google Ads diseñadas para el éxito. Atrae más clientes y aumenta tus conversiones con imSoft.",
  },
  openGraph: {
    title: "Gestión de Campañas en Google Ads",
    description:
      "Alcanza tus objetivos de marketing con campañas de Google Ads optimizadas para rendimiento. Visibilidad mejorada, tráfico de calidad y más conversiones con imSoft.",
  },
};

const introductorySectionInfo: IIntroductorySection = {
  title: "Campañas en Google Ads en Zapopan",
  description:
    "Lanza tu negocio al éxito en Zapopan con campañas optimizadas de Google Ads, diseñadas para captar tu audiencia local y convertir clics en clientes.",
};

const featuresSectionInfo: IFeaturesSection = {
  topic: "Campañas en Google Ads en Zapopan",
  title: "Maximiza Cada Clic en Zapopan",
  description:
    "Aprovecha al máximo cada clic con nuestras campañas en Google Ads, especialmente diseñadas para entregar resultados medibles y un impacto real en Zapopan.",
  serviceFeatures: [
    {
      title: "Estrategia Personalizada",
      description:
        "Desarrollo de estrategias de campaña adaptadas a los objetivos específicos de tu negocio y tu audiencia objetivo.",
      icon: PaintBrushIcon,
    },
    {
      title: "Optimización de Palabras Clave",
      description:
        "Selección y optimización cuidadosa de palabras clave para capturar tráfico de alta calidad y relevante para tu negocio.",
      icon: DocumentTextIcon,
    },
    {
      title: "Creación de Anuncios Atractivos",
      description:
        "Diseño de anuncios persuasivos y llamativos que resuenan con tu audiencia y motivan a la acción.",
      icon: PhotoIcon,
    },
    {
      title: "Segmentación Avanzada",
      description:
        "Utilización de técnicas de segmentación avanzadas para dirigir tus anuncios a los usuarios más propensos a convertir.",
      icon: UsersIcon,
    },
    {
      title: "Gestión de Presupuesto",
      description:
        "Administración eficiente de tu presupuesto para maximizar el retorno sobre la inversión, ajustando las pujas y optimizando el gasto.",
      icon: CurrencyDollarIcon,
    },
    {
      title: "Análisis y Reportes",
      description:
        "Monitorización continua y análisis detallado del rendimiento de la campaña para realizar ajustes estratégicos y mejorar los resultados.",
      icon: ClipboardDocumentIcon,
    },
  ],
};

const pricesSectionInfo: IPricesSection = {
  topic: "Campañas en Google Ads",
  description:
    "Impulsa tu negocio con campañas de Google Ads diseñadas para el éxito.",
  listOfPackages: [
    {
      title: "Paquete de Campañas en Google Ads",
      description:
        "Maximiza tu visibilidad en línea y captura tráfico de calidad con campañas de Google Ads personalizadas y optimizadas.",
      featuresOfPackage: [
        "Auditoría inicial y análisis competitivo para establecer un punto de partida claro.",
        "Desarrollo de una estrategia de campaña personalizada basada en tus metas comerciales.",
        "Creación y optimización de anuncios y selección de palabras clave.",
        "Gestión y ajuste constante de la campaña para optimizar el rendimiento.",
        "Informes periódicos con análisis detallados y recomendaciones de mejora.",
      ],
      price: "A definir según el alcance y la complejidad de la campaña",
    },
  ],
};

const callToActionSectionInfo: ICallToActionSection = {
  image:
    "https://res.cloudinary.com/https-imsoft-io/image/upload/v1706902047/imsoft-images/services/campan%CC%83as-google-ads-imsoft.jpg",
  topic: "Campañas en Google Ads para Zapopan",
  title: "Transforma tus Clics en Conversiones en Zapopan",
  description:
    "Únete a las empresas de Zapopan que utilizan Google Ads para crecer. Descubre cómo nuestras campañas personalizadas pueden elevar tu negocio al siguiente nivel.",
};

const GoogleAdsCampains = () => {
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

export default GoogleAdsCampains;
