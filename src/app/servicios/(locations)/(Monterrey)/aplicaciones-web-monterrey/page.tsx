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
  ChartBarIcon,
  CogIcon,
  DevicePhoneMobileIcon,
  WrenchIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Desarrollo de Aplicaciones Web en Monterrey | imSoft",
  description:
    "En imSoft, creamos aplicaciones web personalizadas en Monterrey para potenciar tu negocio. Mejora tu presencia online, interactúa eficazmente con tus clientes y automatiza tus procesos de negocio con nuestras soluciones web. Diseñamos aplicaciones escalables y adaptables para el futuro de tu empresa en Monterrey.",
  keywords: [
    "imSoft",
    "Aplicaciones web Monterrey",
    "Desarrollo web Monterrey",
    "Soluciones web personalizadas",
  ],
  twitter: {
    title: "Desarrollo de Aplicaciones Web en Monterrey por imSoft",
    description:
      "Descubre cómo imSoft puede transformar tu negocio en Monterrey con aplicaciones web personalizadas. Aumenta tu presencia en línea y mejora la interacción con tus clientes con nuestras soluciones innovadoras.",
  },
  openGraph: {
    title: "Aplicaciones Web Personalizadas en Monterrey | imSoft",
    description:
      "Con imSoft, lleva tu negocio en Monterrey al siguiente nivel con aplicaciones web adaptadas a tus necesidades. Experiencia de usuario mejorada, escalabilidad y adaptabilidad para el futuro de tu empresa.",
  },
};

const introductorySectionInfo: IIntroductorySection = {
  title: "Desarrollo de Aplicaciones Web en Monterrey",
  description:
    "Automatiza tus procesos de negocio, mejora la interacción con tus clientes y asegura un crecimiento escalable con tecnología de vanguardia adaptada a tus necesidades.",
};

const featuresSectionInfo: IFeaturesSection = {
  topic: "Aplicaciones Web en Monterrey",
  title: "Características de Nuestro Servicio",
  description:
    "Eleva tu empresa en Monterrey con aplicaciones web innovadoras que mejoran la eficiencia y la rentabilidad de tu negocio.",
  serviceFeatures: [
    {
      title: "Personalización",
      description:
        "Capacidad de personalizar la aplicación para satisfacer las necesidades específicas de cada cliente.",
      icon: PaintBrushIcon,
    },
    {
      title: "Escalabilidad",
      description:
        "Capacidad de la aplicación para crecer y adaptarse a medida que las necesidades del negocio cambian.",
      icon: ChartBarIcon,
    },
    {
      title: "Automatización",
      description:
        "Capacidad de automatizar procesos y tareas para ahorrar tiempo y aumentar la eficiencia de los colaboradores.",
      icon: CogIcon,
    },
    {
      title: "Integración con dispositivos móviles",
      description:
        "Capacidad de acceder y utilizar la aplicación a través de dispositivos móviles para aumentar la flexibilidad y la movilidad.",
      icon: DevicePhoneMobileIcon,
    },
    {
      title: "Soporte técnico",
      description:
        "Proporcionar soporte técnico y atención al cliente para ayudar a resolver problemas y preguntas.",
      icon: WrenchIcon,
    },
    {
      title: "Seguridad",
      description:
        "Garantizar la privacidad y la protección de los datos sensibles de los usuarios y empresas.",
      icon: ShieldCheckIcon,
    },
  ],
};

const pricesSectionInfo: IPricesSection = {
  topic: "Soluciones de Aplicaciones Web en Monterrey",
  description:
    "Adaptadas a tu negocio en un mundo digital en constante evolución",
  listOfPackages: [
    {
      title: "Paquete Personalizado de Aplicaciones Web",
      description:
        "Convierte tus ideas en realidad con soluciones a medida, diseñadas para el dinámico entorno empresarial de Monterrey.",
      featuresOfPackage: [
        "Reunión inicial para alinear tus visiones y objetivos con las tendencias del mercado en Monterrey.",
        "Planificación y diseño detallados, centrados en las necesidades únicas de tu negocio local.",
        "Desarrollo personalizado basado en especificaciones acordadas, con enfoque en la innovación y eficiencia.",
        "Implementación y configuración en tu entorno de producción, con seguimiento de calidad y rendimiento.",
        "Capacitación integral para usuarios y personal, asegurando una transición fluida y eficiente.",
        "Diseño escalable, preparando tu aplicación para el crecimiento y las necesidades futuras de tu empresa.",
        "Seguridad avanzada para proteger tus datos y los de tus clientes, cumpliendo con las normativas locales.",
        "Diseño responsivo para garantizar una experiencia óptima en computadoras, móviles y tabletas.",
      ],
      price: "10,000",
    },
  ],
};

const callToActionSectionInfo: ICallToActionSection = {
  image:
    "https://res.cloudinary.com/https-imsoft-io/image/upload/v1706595026/imsoft-images/services/aplicacion-web-imsoft.jpg",
  topic: "Soluciones Web Personalizadas en Monterrey",
  title: "Impulsa tu Negocio en Monterrey con Aplicaciones Web a Medida",
  description:
    "Descubre cómo nuestras aplicaciones web pueden revolucionar tu negocio en Monterrey. Mejora tu presencia en línea, interactúa de manera más efectiva con tus clientes locales, y automatiza tus procesos de negocio para una mayor eficiencia. Con nuestras soluciones, garantizamos aplicaciones web escalables y flexibles, diseñadas para evolucionar junto a tu empresa y las demandas del mercado de Monterrey.",
};

const WebAppPageMonterrey = () => {
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

export default WebAppPageMonterrey;
