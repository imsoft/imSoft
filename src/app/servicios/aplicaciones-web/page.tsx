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
  title: "Aplicaciones web",
  description:
    "Nuestras aplicaciones web pueden ayudarte a mejorar tu presencia en línea, aumentar la interacción con tus clientes, mejorar la automatización de tus procesos de negocio, y proporcionar una experiencia de usuario mejorada. También puedes estar seguro de que tu aplicación web será escalable y adaptable para satisfacer las necesidades futuras de tu negocio.",
  keywords: ["imSoft", "Aplicacines web"],
  twitter: {
    title: "Aplicaciones web",
    description:
      "Nuestras aplicaciones web pueden ayudarte a mejorar tu presencia en línea, aumentar la interacción con tus clientes, mejorar la automatización de tus procesos de negocio, y proporcionar una experiencia de usuario mejorada. También puedes estar seguro de que tu aplicación web será escalable y adaptable para satisfacer las necesidades futuras de tu negocio.",
  },
  openGraph: {
    title: "Aplicaciones web",
    description:
      "Nuestras aplicaciones web pueden ayudarte a mejorar tu presencia en línea, aumentar la interacción con tus clientes, mejorar la automatización de tus procesos de negocio, y proporcionar una experiencia de usuario mejorada. También puedes estar seguro de que tu aplicación web será escalable y adaptable para satisfacer las necesidades futuras de tu negocio.",
  },
};

const introductorySectionInfo: IIntroductorySection = {
  title: "Aplicaciones web",
  description:
    "Automatiza y mejora tus procesos de negocio con nuestras aplicaciones web",
};

const featuresSectionInfo: IFeaturesSection = {
  topic: "Aplicaciones web",
  title: "Caracteristicas del servicio",
  description:
    "Mejora la eficiencia y la rentabilidad de tu negocio con nuestras aplicaciones web",
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
  topic: "Aplicaciones web",
  description: "Soluciones innovadoras para un mundo en constante evolución",
  listOfPackages: [
    {
      title: "Paquete de Aplicaciones web",
      description:
        "Hacemos realidad tus ideas con nuestras soluciones personalizadas.",
      featuresOfPackage: [
        "Reunión inicial con el cliente para entender sus necesidades y objetivos.",
        "Desarrollo de una planificación y diseño detallados de la aplicación basados en las necesidades y objetivos del cliente.",
        "Creación y programación de la aplicación en función de las especificaciones acordadas.",
        "Instalación y configuración de la aplicación en el entorno de producción del cliente.",
        "Capacitación de los usuarios y el personal de soporte del cliente en el uso y mantenimiento de la aplicación.",
        "Diseño y programación de la aplicación para que sea escalable y pueda crecer y adaptarse a medida que las necesidades del negocio cambian.",
        "Implementación de medidas de seguridad sólidas para proteger los datos del cliente y garantizar la privacidad.",
        "Diseño responsivo para la adaptabilidad de las pantallas de computadoras, celulares y tabletas.",
      ],
      price: "10,000",
    },
  ],
};

const callToActionSectionInfo: ICallToActionSection = {
  image:
    "https://res.cloudinary.com/https-imsoft-io/image/upload/v1706595026/imsoft-images/services/aplicacion-web-imsoft.jpg",
  topic: "Aplicaciones web",
  title: "Maximiza tu potencial con aplicaciones web personalizadas",
  description:
    "Nuestras aplicaciones web pueden ayudarte a mejorar tu presencia en línea, aumentar la interacción con tus clientes, mejorar la automatización de tus procesos de negocio, y proporcionar una experiencia de usuario mejorada. También puedes estar seguro de que tu aplicación web será escalable y adaptable para satisfacer las necesidades futuras de tu negocio.",
};

const WebAppPage = () => {
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

export default WebAppPage;
