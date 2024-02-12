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
  DocumentTextIcon,
  DocumentChartBarIcon,
  PresentationChartLineIcon,
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Consultoría Web en Monterrey | imSoft",
  description:
    "Expertos en consultoría web en Monterrey, ofreciendo soluciones personalizadas para el desarrollo de sitios y aplicaciones web. Nuestro equipo experto está listo para elevar la presencia online de tu negocio.",
  keywords: [
    "imSoft",
    "Consultoría web",
    "Consultoría web Monterrey",
    "Desarrollo web Monterrey",
  ],
  twitter: {
    title: "Consultoría Web en Monterrey por imSoft",
    description:
      "Descubre cómo nuestra consultoría web en Monterrey puede transformar tu negocio, optimizando tu sitio y aplicaciones web para el éxito.",
  },
  openGraph: {
    title: "Servicios de Consultoría Web en Monterrey | imSoft",
    description:
      "En imSoft, brindamos consultoría web especializada en Monterrey, asegurando que tu sitio web y aplicaciones estén alineados con tus objetivos empresariales.",
  },
};

const introductorySectionInfo: IIntroductorySection = {
  title: "Especialistas en Consultoría Web en Monterrey",
  description:
    "En imSoft, combinamos calidad y eficiencia para ofrecer soluciones de consultoría web que llevan a los negocios de Monterrey al siguiente nivel en el mundo digital.",
};

const featuresSectionInfo: IFeaturesSection = {
  topic: "Consultoría Web Localizada en Monterrey",
  title: "Características de Nuestro Servicio",
  description:
    "Ofrecemos un enfoque personalizado para maximizar el rendimiento y la productividad de su empresa en Monterrey, con soluciones de software a medida.",
  serviceFeatures: [
    {
      title: "Análisis profundo",
      description:
        "Nos adentraremos a lo mas profundo de tu sitio web para conocer sus áreas de oportunidad.",
      icon: EyeIcon,
    },
    {
      title: "Reporte del estado actual",
      description:
        "Redactaremos un reporte donde te describamos el estado actual de tu sitio web.",
      icon: DocumentTextIcon,
    },
    {
      title: "Reporte de mejoras",
      description:
        "Haremos una lista de las mejoras que te recomendaremos para que el estado de tu sitio web mejore considerablemente.",
      icon: DocumentChartBarIcon,
    },
    {
      title: "Asesoramiento de las tecnologías",
      description:
        "Te diremos como funcionan ciertas tecnologías de tu sitio web y el como sacarles provecho.",
      icon: PresentationChartLineIcon,
    },
    {
      title: "Plan de Marketing",
      description:
        "Realizaremos una buena estrategia de marketing para que más clientes compren o contraten tus servicios.",
      icon: ClipboardDocumentCheckIcon,
    },
    {
      title: "Honestidad",
      description:
        "Tendrás lo que realmente necesitas porque entendemos perfectamente lo importante y difícil que es tener una empresa.",
      icon: CheckCircleIcon,
    },
  ],
};

const pricesSectionInfo: IPricesSection = {
  topic: "Paquete de Consultoría Web en Monterrey",
  description:
    "Soluciones personalizadas de consultoría web para impulsar el crecimiento de tu negocio en Monterrey.",
  listOfPackages: [
    {
      title: "Paquete de consultoría #1",
      description:
        "Nuestro enfoque en la calidad y la eficiencia en el desarrollo de software nos permite brindar soluciones excepcionales a nuestros clientes.",
      featuresOfPackage: [
        "Reporte del estado actual",
        "Reporte de mejoras",
        "Asesoramiento del uso de las tecnologías",
        "Plan de marketing",
        "Cuatro sesiones mensuales con duración de 1hr",
      ],
      price: "10,000",
    },
  ],
};

const callToActionSectionInfo: ICallToActionSection = {
  image:
    "https://res.cloudinary.com/https-imsoft-io/image/upload/v1706595026/imsoft-images/services/consultoria-imSoft.jpg",
  topic: "Consultoría Web Profesional en Monterrey",
  title: "Eleva tu Negocio en Monterrey con Nuestra Consultoría Web",
  description:
    "En imSoft, combinamos experiencia y conocimiento local para ofrecerte una consultoría web en Monterrey que cumpla y exceda tus expectativas.",
};

const ConsultancyPage = () => {
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

export default ConsultancyPage;
