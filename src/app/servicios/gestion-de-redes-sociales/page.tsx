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
    title: "Gestión Profesional de Redes Sociales",
    description:
      "Nuestro servicio integral de gestión de redes sociales está diseñado para elevar tu presencia en línea, fortalecer la conexión con tu audiencia y potenciar el alcance de tu marca. Administramos tus perfiles sociales con contenido dinámico, interacciones significativas y estrategias de crecimiento adaptadas a las tendencias digitales actuales, asegurando que tu marca destaque en el ruidoso mundo de las redes sociales.",
    keywords: ["imSoft", "Gestión de Redes Sociales", "Marketing Digital", "Engagement Social"],
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
    title: "Gestión de Redes Sociales",
    description:
      "Mantén una presencia vibrante y efectiva en redes sociales con nuestro servicio de gestión integral. Conecta, comunica y convierte con estrategias personalizadas.",
  };
  
  const featuresSectionInfo: IFeaturesSection = {
    topic: "Gestión de Redes Sociales",
    title: "¿Qué incluye nuestro servicio?",
    description:
      "Desde la creación de contenido hasta el análisis de resultados, ofrecemos una gestión completa para que tu marca brille en redes sociales.",
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
    description: "Potencia tu presencia en línea con nuestra gestión experta de redes sociales.",
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
    topic: "Gestión de Redes Sociales",
    title: "Amplía tu alcance y fortalece tu marca en redes sociales",
    description:
      "Con nuestra experiencia y enfoque personalizado, tu presencia en redes sociales se transformará en un activo poderoso para tu negocio. Comienza hoy y descubre el impacto de una gestión profesional.",
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
