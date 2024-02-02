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
  ChevronDoubleDownIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Desarrollo de Aplicaciones Móviles en Tlaquepaque | imSoft",
  description:
    "Especialistas en desarrollo de aplicaciones móviles a medida en Tlaquepaque, diseñadas para impulsar la engagement de los usuarios y optimizar la experiencia móvil.",
  keywords: [
    "imSoft",
    "Aplicaciones móviles Tlaquepaque",
    "Desarrollo móvil Tlaquepaque",
    "Apps Tlaquepaque",
  ],
  twitter: {
    title: "Desarrollo de Aplicaciones Móviles",
    description:
      "Impulsa tu negocio con aplicaciones móviles a medida. Mejora la experiencia de tus usuarios y abre nuevas vías de interacción y crecimiento con imSoft.",
  },
  openGraph: {
    title: "Desarrollo de Aplicaciones Móviles",
    description:
      "Transforma tu estrategia digital con nuestras soluciones móviles personalizadas. Escalabilidad, seguridad y diseño centrado en el usuario con imSoft.",
  },
};

const introductorySectionInfo: IIntroductorySection = {
  title: "Aplicaciones Móviles en Tlaquepaque",
  description:
    "Lleva tu negocio en Tlaquepaque al siguiente nivel con aplicaciones móviles innovadoras, diseñadas para ofrecer la mejor experiencia a tus usuarios locales.",
};

const featuresSectionInfo: IFeaturesSection = {
  topic: "Desarrollo de Aplicaciones Móviles",
  title: "Soluciones Móviles en Tlaquepaque",
  description:
    "Desarrollamos aplicaciones móviles que marcan la diferencia en Tlaquepaque, mejorando la experiencia del usuario y el rendimiento empresarial.",

  serviceFeatures: [
    {
      title: "Diseño UX/UI",
      description:
        "Diseños intuitivos y atractivos que garantizan una excelente experiencia de usuario y engagement.",
      icon: PaintBrushIcon,
    },
    {
      title: "Desarrollo Nativo e Híbrido",
      description:
        "Expertos en desarrollo tanto nativo (iOS y Android) como híbrido, asegurando la mejor performance y adaptabilidad.",
      icon: DevicePhoneMobileIcon,
    },
    {
      title: "Integración de APIs",
      description:
        "Integraciones fluidas con sistemas existentes y terceros para ampliar la funcionalidad y el valor de tu aplicación.",
      icon: GlobeAltIcon,
    },
    {
      title: "Optimización de rendimiento",
      description:
        "Aplicaciones optimizadas para un rendimiento superior, asegurando tiempos de carga rápidos y una experiencia fluida.",
      icon: ChevronDoubleDownIcon,
    },
    {
      title: "Seguridad",
      description:
        "Implementación de las mejores prácticas de seguridad para proteger la información de los usuarios y la integridad de la aplicación.",
      icon: ShieldCheckIcon,
    },
    {
      title: "Soporte y Mantenimiento",
      description:
        "Servicios continuos de soporte y mantenimiento para asegurar que tu aplicación permanezca actualizada y funcione sin problemas.",
      icon: WrenchScrewdriverIcon,
    },
  ],
};

const pricesSectionInfo: IPricesSection = {
  topic: "Aplicaciones Móviles",
  description:
    "Soluciones móviles personalizadas para impulsar tu negocio en la era digital",
  listOfPackages: [
    {
      title: "Paquete de Desarrollo de Aplicaciones Móviles",
      description:
        "Desde la conceptualización hasta el lanzamiento, desarrollamos tu aplicación móvil enfocándonos en tus objetivos de negocio y las necesidades de tus usuarios.",
      featuresOfPackage: [
        "Análisis y definición de requisitos junto al cliente para alinear objetivos y expectativas.",
        "Diseño UX/UI centrado en el usuario para crear experiencias memorables.",
        "Desarrollo y pruebas de la aplicación para garantizar calidad y rendimiento.",
        "Estrategias de lanzamiento y promoción para maximizar la adopción de usuarios.",
        "Permitir a los usuarios compartir contenido y conectarse con otros a través de sus redes sociales puede aumentar la visibilidad de la aplicación.",
        "Funcionar sin problemas en diferentes dispositivos y sistemas operativos aumenta el alcance de la aplicación.",
      ],
      price: "A definir según el alcance del proyecto",
    },
  ],
};

const callToActionSectionInfo: ICallToActionSection = {
  image:
    "https://res.cloudinary.com/https-imsoft-io/image/upload/v1706898396/imsoft-images/services/aplicaciones-moviles-imsoft.jpg",
  topic: "Aplicaciones Móviles para Tlaquepaque",
  title: "Innova en Tlaquepaque con Aplicaciones Móviles a Medida",
  description:
    "Transforma tu negocio en Tlaquepaque con aplicaciones móviles que reflejan la esencia de tu marca y conectan con tus usuarios. Descubre cómo podemos llevar tu idea a la realidad.",
};

const MobileAppsPage = () => {
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

export default MobileAppsPage;
