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
  PresentationChartBarIcon,
  CircleStackIcon,
  ClipboardDocumentCheckIcon,
  TableCellsIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Análisis de Datos",
  description:
    "Nuestro servicio de análisis de datos te permite descubrir patrones y obtener insights valiosos para impulsar la toma de decisiones estratégicas. Transformamos grandes volúmenes de datos en información clara y accionable, ayudándote a entender mejor a tus clientes, optimizar operaciones y predecir tendencias futuras. Nuestros sistemas son escalables y se adaptan a las necesidades cambiantes de tu negocio.",
  keywords: [
    "imSoft",
    "Análisis de datos",
    "Big Data",
    "Business Intelligence",
  ],
  twitter: {
    title: "Análisis de Datos",
    description:
      "Descubre cómo nuestro análisis de datos puede impulsar tu estrategia empresarial, optimizar operaciones y predecir tendencias futuras. Convierte datos en decisiones con imSoft.",
  },
  openGraph: {
    title: "Análisis de Datos",
    description:
      "Transforma datos en decisiones con nuestro análisis. Optimiza tu estrategia empresarial y anticipa tendencias con imSoft.",
  },
};

const introductorySectionInfo: IIntroductorySection = {
  title: "Análisis de Datos",
  description:
    "Convierte grandes volúmenes de datos en decisiones estratégicas con nuestro servicio de análisis.",
};

const featuresSectionInfo: IFeaturesSection = {
  topic: "Análisis de Datos",
  title: "Características de nuestro servicio",
  description:
    "Optimiza tu toma de decisiones y estrategia empresarial con nuestro avanzado análisis de datos",
  serviceFeatures: [
    {
      title: "Análisis Predictivo",
      description:
        "Utiliza modelos estadísticos y machine learning para predecir tendencias y comportamientos futuros.",
      icon: EyeIcon,
    },
    {
      title: "Visualización de Datos",
      description:
        "Transforma datos complejos en visualizaciones claras e interactivas para facilitar la comprensión.",
      icon: PresentationChartBarIcon,
    },
    {
      title: "Big Data",
      description:
        "Maneja grandes volúmenes y variedades de datos a alta velocidad para obtener insights en tiempo real.",
      icon: CircleStackIcon,
    },
    {
      title: "Inteligencia de Negocios",
      description:
        "Combina análisis de datos y conocimiento empresarial para mejorar la estrategia y eficiencia.",
      icon: ClipboardDocumentCheckIcon,
    },
    {
      title: "Minería de Datos",
      description:
        "Descubre patrones y relaciones ocultas en grandes conjuntos de datos para informar decisiones.",
      icon: TableCellsIcon,
    },
    {
      title: "Seguridad de Datos",
      description:
        "Asegura la integridad y privacidad de tus datos con prácticas de seguridad avanzadas.",
      icon: ShieldExclamationIcon,
    },
  ],
};

const pricesSectionInfo: IPricesSection = {
  topic: "Análisis de Datos",
  description:
    "Soluciones de análisis de datos para impulsar tu negocio hacia adelante",
  listOfPackages: [
    {
      title: "Paquete de Análisis de Datos",
      description:
        "Transforma tu mar de datos en insights accionables y estrategias de negocio concretas.",
      featuresOfPackage: [
        "Evaluación inicial para entender tus objetivos de negocio y fuentes de datos.",
        "Desarrollo de un plan de análisis personalizado basado en tus necesidades específicas.",
        "Implementación de herramientas de análisis y visualización de datos.",
        "Análisis predictivo y minería de datos para descubrir insights valiosos.",
        "Entrega de reportes detallados y dashboards interactivos.",
        "Soporte continuo y ajustes basados en la evolución de tus necesidades de negocio.",
      ],
      price: "A definir según el alcance del proyecto",
    },
  ],
};

const callToActionSectionInfo: ICallToActionSection = {
  image:
    "https://res.cloudinary.com/https-imsoft-io/image/upload/v1706898185/imsoft-images/services/analisis-de-datos-imsoft.jpg",
  topic: "Análisis de Datos",
  title: "Impulsa tu negocio con insights basados en datos",
  description:
    "Aprovecha el poder del análisis de datos para entender mejor a tus clientes, optimizar tus operaciones y liderar el mercado. Contáctanos para descubrir cómo podemos transformar tus datos en crecimiento.",
};

const DataAnalitycsPage = () => {
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

export default DataAnalitycsPage;
