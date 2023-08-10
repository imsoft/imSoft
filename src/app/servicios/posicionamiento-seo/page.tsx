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
  BuildingStorefrontIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  PencilSquareIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

const index = () => {
  const introductorySectionInfo: IIntroductorySection = {
    title: "Posicionamiento SEO",
    description: "Lleguemos juntos a las primeras posiciones de Google",
  };

  const featuresSectionInfo: IFeaturesSection = {
    topic: "Posicionamiento SEO",
    title: "Caracteristicas del servicio",
    description:
      "Las personas únicamente les hace caso a los primeros enlaces de Google",
    serviceFeatures: [
      {
        title: "Análisis de palabras clave",
        description:
          "Conoceremos tu negocio y la palabra clave con la que te quieres dar a conocer.",
        icon: EyeIcon,
      },
      {
        title: "Análisis del mercado",
        description:
          "Analizaremos a tu publico objetivo para adaptarnos a lo que ellos buscan.",
        icon: BuildingStorefrontIcon,
      },
      {
        title: "Análisis de la competencia",
        description:
          "Conoceremos a tu competencia y superaremos sus estrategias.",
        icon: UserGroupIcon,
      },
      {
        title: "Mantenimiento al sitio web",
        description:
          "Detectaremos fallos en tu web actual y daremos las mejores soluciones.",
        icon: WrenchScrewdriverIcon,
      },
      {
        title: "Generación de artículos",
        description:
          "El contenido por excelencia en los sitios web son los artículos.",
        icon: PencilSquareIcon,
      },
      {
        title: "Meta etiquetas",
        description:
          "Le diremos a Google quienes somos y donde queremos estar.",
        icon: TagIcon,
      },
    ],
  };

  const pricesSectionInfo: IPricesSection = {
    topic: "Posicionamiento SEO",
    description: "Lleguemos juntos a las primeras posiciones de Google",
    listOfPackages: [
      {
        title: "Paquete de Posicionamiento SEO",
        description:
          "Con nuestro SEO, tu negocio alcanzará nuevos clientes y más ventas.",
        featuresOfPackage: [
          "Análisis y optimización de la estructura y el contenido del sitio web",
          "Investigación y selección de palabras clave relevantes",
          "Optimización del contenido del sitio web con palabras clave seleccionadas",
          "Generación de enlaces entrantes (backlinks) de calidad",
          "Monitorización y análisis de los resultados del posicionamiento y del tráfico web",
          "Generación de contenido de calidad para el blog del sitio web",
          "Optimización de la experiencia de usuario (UX) y la velocidad de carga del sitio web",
          "Optimización de la presencia del sitio web en las redes sociales y en otros canales en línea",
        ],
        price: "10,000",
      },
    ],
  };

  const callToActionSectionInfo: ICallToActionSection = {
    image:
      "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/imsoft/logotipo-imsoft-cuadrado.png",
    topic: "Posicionamiento SEO",
    title: "Llevamos tu negocio al top de Google",
    description:
      "Si quieres que tu negocio tenga éxito en línea, es esencial que tenga una buena presencia en los resultados de búsqueda de Google. El posicionamiento SEO no es algo que se logre de la noche a la mañana, sino que requiere de una estrategia bien planificada y de técnicas especializadas. Es aquí donde entran mis servicios de desarrollo de posicionamiento SEO. Si quieres que tu negocio alcance nuevos clientes y aumente sus ventas en línea, no dudes en contactarme y solicitar una cotización. Estoy seguro de que podemos ayudarte a alcanzar tus objetivos y a tener éxito en el mundo digital.",
  };

  const metatagsInfo: RequiredMetatags = {
    title: "Posicionamiento SEO | imSoft",
    description: "Si quieres que tu negocio tenga éxito en línea, es esencial que tenga una buena presencia en los resultados de búsqueda de Google. El posicionamiento SEO no es algo que se logre de la noche a la mañana, sino que requiere de una estrategia bien planificada y de técnicas especializadas. Es aquí donde entran mis servicios de desarrollo de posicionamiento SEO. Si quieres que tu negocio alcance nuevos clientes y aumente sus ventas en línea, no dudes en contactarme y solicitar una cotización. Estoy seguro de que podemos ayudarte a alcanzar tus objetivos y a tener éxito en el mundo digital",
    keywords: "Posicionamiento SEO, imSoft",
    author: "Brandon Uriel García Ramos",
    subject: "Posicionamiento SEO",
    date: dateMetatagInfo,
    type: "Posicionamiento SEO",
    source: "https://www.imsoft.io/posicionamiento-seo",
    image: "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/imsoft/logotipo-imsoft-cuadrado.png",
    url: "https://www.imsoft.io/posicionamiento-seo",
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
