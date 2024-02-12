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
  PhotoIcon,
  PresentationChartBarIcon,
  UsersIcon,
  EyeIcon,
  PresentationChartLineIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestión Profesional de Redes Sociales en CDMX | imSoft",
  description:
    "Eleva tu presencia en línea en CDMX con nuestro servicio integral de gestión de redes sociales. Conectamos tu marca con la audiencia local a través de contenido dinámico y estrategias adaptadas.",
  keywords: [
    "imSoft",
    "Gestión de Redes Sociales en CDMX",
    "Marketing Digital CDMX",
    "Engagement Social CDMX",
  ],
  twitter: {
    title: "Gestión Profesional de Redes Sociales",
    description:
      "Eleva tu marca en redes sociales con nuestra gestión experta. Contenido dinámico, interacción auténtica y estrategias de crecimiento para tu negocio.",
  },
  openGraph: {
    title: "Gestión Profesional de Redes Sociales",
    description:
      "Transforma tu presencia en redes con gestión experta. Aprovecha al máximo cada plataforma para crecer y conectar con tu audiencia.",
  },
};

const introductorySectionInfo: IIntroductorySection = {
  title: "Gestión de Redes Sociales en CDMX",
  description:
    "Aprovecha nuestro servicio integral para destacar tu marca en las redes sociales de CDMX, conectando auténticamente con tu audiencia local.",
};

const featuresSectionInfo: IFeaturesSection = {
  topic: "Gestión de Redes Sociales en CDMX",
  title: "Servicios adaptados a tu audiencia local",
  description:
    "Nuestro enfoque está diseñado para resonar con la comunidad de CDMX, desde la creación de contenido hasta la interacción y el análisis de resultados.",
  serviceFeatures: [
    {
      title: "Creación de Contenido",
      description:
        "Contenido creativo y relevante diseñado para resonar con tu audiencia y reflejar los valores de tu marca.",
      icon: PhotoIcon,
    },
    {
      title: "Estrategia de Publicación",
      description:
        "Calendarios de publicación estratégicos que aseguran visibilidad y engagement continuo.",
      icon: PresentationChartBarIcon,
    },
    {
      title: "Interacción con la Audiencia",
      description:
        "Gestión activa de comentarios y mensajes para fomentar una comunidad leal y comprometida.",
      icon: UsersIcon,
    },
    {
      title: "Análisis y Reportes",
      description:
        "Seguimiento y análisis de métricas para optimizar estrategias y demostrar ROI tangible.",
      icon: EyeIcon,
    },
    {
      title: "Gestión de Crisis",
      description:
        "Respuesta rápida y gestión eficiente de situaciones imprevistas para proteger la reputación de tu marca.",
      icon: BellAlertIcon,
    },
    {
      title: "Optimización de Perfiles",
      description:
        "Mantenimiento y actualización constante de perfiles para asegurar coherencia y relevancia.",
      icon: PresentationChartLineIcon,
    },
  ],
};

const pricesSectionInfo: IPricesSection = {
  topic: "Gestión de Redes Sociales",
  description:
    "Potencia tu presencia en línea con nuestra gestión experta de redes sociales.",
  listOfPackages: [
    {
      title: "Paquete de Gestión de Redes Sociales",
      description:
        "Deja en nuestras manos la dinámica diaria de tus redes sociales y enfócate en crecer tu negocio.",
      featuresOfPackage: [
        "Auditoría inicial de redes sociales para establecer la línea base y objetivos.",
        "Desarrollo e implementación de una estrategia de contenido adaptada a cada plataforma.",
        "Programación regular de publicaciones para maximizar el alcance y engagement.",
        "Monitorización y gestión proactiva de la interacción con los usuarios.",
        "Análisis mensual del desempeño y ajustes estratégicos para mejorar los resultados.",
      ],
      price: "A definir según las necesidades y el tamaño de la empresa",
    },
  ],
};

const callToActionSectionInfo: ICallToActionSection = {
  image:
    "https://res.cloudinary.com/https-imsoft-io/image/upload/v1706899598/imsoft-images/services/gestion-de-redes-sociales-imsoft.jpg",
  topic: "Gestión de Redes Sociales para CDMX",
  title: "Conecta con tu audiencia en CDMX",
  description:
    "Descubre el impacto de una gestión profesional de redes sociales enfocada en CDMX. Transformamos tu presencia en línea para destacar en el mercado local.",
};

const SocialMediaManagementPage = () => {
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

export default SocialMediaManagementPage;
