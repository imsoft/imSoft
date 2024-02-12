import { Metadata } from "next";
import {
  IntroductorySection,
  FeaturesSection,
  CallToActionSection,
  MonthlyPaymentSection,
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
  title: "Desarrollo de Sitio Web en CDMX | imSoft",
  description:
    "En imSoft, creamos sitios web atractivos y funcionales para negocios en CDMX. Contáctanos para darle a tu negocio una sólida presencia en línea.",
  keywords: [
    "imSoft",
    "Sitio web",
    "Desarrollo web CDMX",
    "Diseño web CDMX",
  ],
  twitter: {
    title: "Sitio Web en CDMX | imSoft",
    description:
      "Lleva tu negocio en CDMX al mundo digital con un sitio web atractivo y funcional. En imSoft, estamos listos para ayudarte a alcanzar tus objetivos digitales.",
  },
  openGraph: {
    title: "Desarrollo de Sitio Web en CDMX | imSoft",
    description:
      "¿Necesitas un sitio web para tu negocio en CDMX? En imSoft, diseñamos y desarrollamos soluciones web que se adaptan a tus necesidades.",
  },
};

const introductorySectionInfo: IIntroductorySection = {
  title: "Desarrollo de Sitio Web Profesional en CDMX",
  description:
    "Ya diste el primer paso hacia el éxito digital. Permítenos en imSoft acompañarte en el siguiente, creando un sitio web que destaque tu negocio en CDMX.",
};

const featuresSectionInfo: IFeaturesSection = {
  topic: "Sitio Web Personalizado para CDMX",
  title: "Características de Nuestros Sitios Web",
  description:
    "Ofrecemos sitios web personalizados para empresas en CDMX, diseñados para aumentar tu alcance y potenciar tus ventas en línea.",
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
  topic: "Paquete de Sitio Web para Negocios en CDMX",
  description:
    "Ofrecemos paquetes de desarrollo web asequibles y personalizados, perfectos para empresas emergentes y establecidas en CDMX.",
  listOfPackages: [
    {
      title: "Paquete de Sitio Web",
      description:
        "Diseñamos y desarrollamos sitios web personalizados a tu medida.",
      featuresOfPackage: [
        "Garantiza una experiencia de usuario óptima en todos los dispositivos, incluyendo móviles, tabletas y desktops.",
        "Mejora la visibilidad del sitio web en motores de búsqueda, lo que puede aumentar el tráfico orgánico.",
        "Implementa características de seguridad como HTTPS, protección contra malware y backups regulares para proteger la información del sitio y de los usuarios.",
        "Asegura tiempos de carga rápidos para mejorar la experiencia del usuario y contribuir positivamente al SEO.",
        "Facilita la compartición de contenido y aumenta la visibilidad en plataformas sociales.",
        "Ofrece asistencia continua para resolver problemas técnicos y mantener el sitio web actualizado.",
      ],
      price: "8,999",
    },
  ],
};

const callToActionSectionInfo: ICallToActionSection = {
  image:
    "https://res.cloudinary.com/https-imsoft-io/image/upload/v1706595026/imsoft-images/services/sitio-web-imsoft.jpg",
  topic: "Desarrollo de Sitio Web en CDMX",
  title: "Crea tu Presencia Online en CDMX",
  description:
    "Eleva tu negocio en CDMX al mundo digital con un sitio web atractivo y funcional de imSoft. Contáctanos y comienza a transformar tu presencia en línea.",
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

export default WebPagePage;
