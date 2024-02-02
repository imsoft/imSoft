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
  CubeTransparentIcon,
  PresentationChartLineIcon,
  EyeIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestión de Campañas de Redes Sociales",
  description:
    "Maximiza tu impacto en redes sociales con nuestras campañas personalizadas. Diseñamos estrategias que aumentan la visibilidad de tu marca, fomentan la interacción con tu audiencia y impulsan conversiones. Nuestro enfoque orientado a resultados asegura que tu marca se mantenga relevante y competitiva en el dinámico mundo de las redes sociales.",
  keywords: [
    "imSoft",
    "Campañas de Redes Sociales",
    "Marketing Digital",
    "Engagement",
  ],
  twitter: {
    title: "Gestión de Campañas de Redes Sociales",
    description:
      "Impulsa tu presencia en línea con estrategias de redes sociales que capturan y retienen la atención de tu audiencia. Con imSoft, transforma tus redes en canales de crecimiento.",
  },
  openGraph: {
    title: "Gestión de Campañas de Redes Sociales",
    description:
      "Eleva tu estrategia de marketing con campañas de redes sociales que conectan, convierten y retienen. Descubre el poder de una comunicación efectiva con imSoft.",
  },
};

const introductorySectionInfo: IIntroductorySection = {
  title: "Campañas de Redes Sociales",
  description:
    "Conecta con tu audiencia y potencia tu marca con campañas creativas y estratégicas en redes sociales.",
};

const featuresSectionInfo: IFeaturesSection = {
  topic: "Campañas de Redes Sociales",
  title: "Características de nuestro servicio",
  description:
    "Desarrollamos campañas de redes sociales enfocadas en el engagement y la conversión, utilizando lo último en tendencias digitales y análisis de datos.",
  serviceFeatures: [
    {
      title: "Estrategia Personalizada",
      description:
        "Creación de estrategias a medida según tus objetivos de negocio y el perfil de tu audiencia.",
      icon: CubeTransparentIcon,
    },
    {
      title: "Contenido Creativo",
      description:
        "Diseño de contenido creativo y relevante que resuena con tu audiencia y promueve la interacción.",
      icon: PaintBrushIcon,
    },
    {
      title: "Optimización de Anuncios",
      description:
        "Gestión y optimización de anuncios para maximizar el retorno de la inversión y alcanzar objetivos específicos.",
      icon: PresentationChartLineIcon,
    },
    {
      title: "Monitoreo y Análisis",
      description:
        "Seguimiento en tiempo real de las campañas para ajustes ágiles basados en el rendimiento y análisis de datos.",
      icon: EyeIcon,
    },
    {
      title: "Engagement de la Audiencia",
      description:
        "Estrategias para aumentar la interacción con los usuarios y fortalecer la comunidad en línea.",
      icon: UserGroupIcon,
    },
    {
      title: "Reportes Detallados",
      description:
        "Entrega de reportes detallados sobre el rendimiento de las campañas y las métricas clave de éxito.",
      icon: ClipboardDocumentCheckIcon,
    },
  ],
};

const pricesSectionInfo: IPricesSection = {
  topic: "Campañas de Redes Sociales",
  description:
    "Impulsa tu negocio en el mundo digital con campañas de redes sociales efectivas y medibles",
  listOfPackages: [
    {
      title: "Paquete de Campañas de Redes Sociales",
      description:
        "Lleva tu presencia en redes sociales al siguiente nivel con estrategias personalizadas y contenido que captura la esencia de tu marca.",
      featuresOfPackage: [
        "Análisis inicial para entender la posición de tu marca en redes sociales.",
        "Desarrollo de una estrategia de contenido adaptada a cada plataforma.",
        "Creación y programación de contenido creativo y atractivo.",
        "Gestión y optimización de campañas publicitarias.",
        "Monitoreo constante y ajustes basados en el análisis de datos.",
        "Reportes mensuales para evaluar el progreso y planificar futuras acciones.",
      ],
      price: "A definir según el alcance de la campaña",
    },
  ],
};

const callToActionSectionInfo: ICallToActionSection = {
  image:
    "https://res.cloudinary.com/https-imsoft-io/image/upload/v1706899599/imsoft-images/services/campan%CC%83as-de-redes-sociales-imsoft.jpg",
  topic: "Campañas de Redes Sociales",
  title: "Transforma tu presencia digital con campañas de alto impacto",
  description:
    "Da vida a tu estrategia de redes sociales y conecta con tu audiencia de manera auténtica y memorable. Inicia tu campaña con imSoft y ve más allá de las expectativas.",
};

const SocialMediaCampainsPage = () => {
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

export default SocialMediaCampainsPage;
