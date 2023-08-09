import {
  IntroductorySection,
  FeaturesSection,
  MonthlyPaymentSection,
  CallToActionSection,
} from "@/components/ui/services";
import { dateMetatagInfo } from "@/data";
import {
  IIntroductorySection,
  IFeaturesSection,
  IPricesSection,
  ICallToActionSection,
  RequiredMetatags,
} from "@/interfaces";
import {
  EyeIcon,
  DocumentTextIcon,
  DocumentChartBarIcon,
  PresentationChartLineIcon,
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const index = () => {
  const introductorySectionInfo: IIntroductorySection = {
    title: "Consultoría de Sitio Web",
    description:
      "Nuestro enfoque en la calidad y la eficiencia en el desarrollo de software nos permite brindar soluciones excepcionales a nuestros clientes",
  };

  const featuresSectionInfo: IFeaturesSection = {
    topic: "Consultoría de sitio web",
    title: "Caracteristicas del servicio",
    description:
      "Maximizamos el rendimiento y la productividad de su empresa con software diseñado específicamente para usted",
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
    topic: "Consultoría de sitio web",
    description:
      "Diseñamos y desarrollamos soluciones de software que impulsan el crecimiento de su empresa",
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
      "https://firebasestorage.googleapis.com/v0/b/imsoft-website.appspot.com/o/Servicios%2FConsultoria%20imSoft.jpg.jpg?alt=media&token=ee427b3a-06b4-40e0-abb6-ad79f0f3b31f",
    topic: "Consultoría de sitio web",
    title: "Estamos aquí para ayudar",
    description:
      "Somos una empresa altamente calificada y con experiencia en la creación de sitios web y aplicaciones web. Estamos seguro de poder brindarle a su empresa un servicio de alta calidad y entregar un producto final que cumpla con sus expectativas y necesidades.",
  };

  const metatagsInfo: RequiredMetatags = {
    title: "Consultoría de sitio web | imSoft",
    description: "Somos una empresa altamente calificada y con experiencia en la creación de sitios web y aplicaciones web. Estamos seguro de poder brindarle a su empresa un servicio de alta calidad y entregar un producto final que cumpla con sus expectativas y necesidades",
    keywords: "Consultoría de sitio web, imSoft",
    author: "Brandon Uriel García Ramos",
    subject: "Consultoría de sitio web",
    date: dateMetatagInfo,
    type: "Consultoría de sitio web",
    source: "https://www.imsoft.io/consultoria",
    image: "https://firebasestorage.googleapis.com/v0/b/imsoft-website.appspot.com/o/Servicios%2FConsultoria%20imSoft.jpg.jpg?alt=media&token=ee427b3a-06b4-40e0-abb6-ad79f0f3b31",
    url: "https://www.imsoft.io/consultoria",
    robots: "index,follow",
    _id: "",
    tags: []
  };

  return (
    <>
      {/* MetaEtiquetas Básicas */}
      <title>{metatagsInfo.title}</title>
      <meta name="title" content={metatagsInfo.title} />
      <meta httpEquiv="title" content={metatagsInfo.title} />
      <meta name="description" lang="es" content={metatagsInfo.description} />
      <meta name="keywords" lang="es" content={metatagsInfo.keywords} />
      <meta name="date" content={metatagsInfo.date} />

      {/* Informacion del autor */}
      <meta name="author" content={metatagsInfo.author} />

      {/* Dublincore */}
      <meta name="DC.title" lang="es-MX" content={metatagsInfo.title} />
      <meta name="DC.creator" lang="es-MX" content={metatagsInfo.author} />
      <meta name="DC.subject" lang="es-MX" content={metatagsInfo.subject} />
      <meta
        name="DC.description"
        lang="es-MX"
        content={metatagsInfo.description}
      />
      <meta name="DC.publisher" lang="es-MX" content={metatagsInfo.author} />
      <meta name="DC.date" lang="es-MX" content={metatagsInfo.date} />
      <meta name="DC.type" lang="es-MX" content={metatagsInfo.type} />
      <meta name="DC.identifier" lang="es-MX" content={metatagsInfo.title} />
      <meta name="DC.source" lang="es-MX" content={metatagsInfo.source} />
      <meta name="DC.relation" lang="es-MX" content={metatagsInfo.source} />

      {/* Twitter */}
      <meta name="twitter:title" content={metatagsInfo.title} />
      <meta name="twitter:description" content={metatagsInfo.description} />
      <meta name="twitter:image:src" content={metatagsInfo.image} />
      <meta name="twitter:image:alt" content={metatagsInfo.title} />

      {/* Facebook */}
      <meta property="og:title" content={metatagsInfo.title} />
      <meta property="og:type" content={metatagsInfo.type} />
      <meta
        property="og:url"
        content={`https://www.imsoft.io${metatagsInfo.url}`}
      />
      <meta property="og:image" content={metatagsInfo.image} />
      <meta property="og:description" content={metatagsInfo.description} />

      {/* Google + / Pinterest */}
      <meta itemProp="description" content={metatagsInfo.description} />
      <meta itemProp="image" content={metatagsInfo.image} />

      {/* Robots */}
      <meta name="robots" content={metatagsInfo.robots} />

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

export default index;
