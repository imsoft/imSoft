import {
  IntroductorySection,
  FeaturesSection,
  PricesSection,
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
  BoltIcon,
  PencilSquareIcon,
  MagnifyingGlassCircleIcon,
  ArrowTrendingUpIcon,
  PencilIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";

const index = () => {
  const introductorySectionInfo: IIntroductorySection = {
    title: "Sitio Web Pro",
    description:
      "Utilizamos las mejores tecnologías para que tu empresa llegue al siguiente nivel",
  };

  const featuresSectionInfo: IFeaturesSection = {
    topic: "Sitio Web Pro",
    title: "Caracteristicas del servicio",
    description:
      "Un sitio web bien administrado es el arma más poderosa de una empresa y con la utilización de estas herramientas podrás hacer de tu empresa algo más profesional",
    serviceFeatures: [
      {
        title: "Sitio Web Ultra Rápido",
        description:
          "Con este servicio la velocidad de tu sitio web cambiara drásticamente y así tener una mejor retención del usuario.",
        icon: BoltIcon,
      },
      {
        title: "Personalizable",
        description:
          "Este servicio te ayudara a aterrizar tus ideas para que tus clientes tengan una mejor experiencia de usuario.",
        icon: PencilSquareIcon,
      },
      {
        title: "SEO Friendly",
        description:
          "El SEO es fundamental para las empresas que buscan ser encontradas, y por eso esta tecnología es la mejor para ti.",
        icon: MagnifyingGlassCircleIcon,
      },
      {
        title: "De las tecnologías web más populares",
        description:
          "Las mejores empresas utilizan Next.js porque saben el poder y los resultados a los que se pueden llegar.",
        icon: ArrowTrendingUpIcon,
      },
      {
        title: "Rápido de trabajar",
        description:
          "Cada empresa es diferente y con ello llegan muchas ideas, te ayudaremos a plasmar esas ideas de manera fácil y rápida.",
        icon: PencilIcon,
      },
      {
        title: "Sitio web ligero",
        description:
          "Google se fija mucho en la velocidad y peso de los sitios web, por eso esta es la mejor opción para ti.",
        icon: ComputerDesktopIcon,
      },
    ],
  };

  const pricesSectionInfo: IPricesSection = {
    topic: "Sitio Web",
    description:
      "Experiencia y profesionalismo en cada proyecto de desarrollo web",
    listOfPackages: [
      {
        title: "Paquete de Sitio Web Pro #1",
        description: "Te acompañamos en el crecimiento de tu negocio en línea.",
        featuresOfPackage: [
          "Hasta cuatro páginas",
          "Adaptación de dispositivos móviles",
          "Formulario de contacto",
          "Mapa de ubicación",
          "Enlaces a redes sociales",
          "Enlace a número de WhatsApp",
          "Certificado de seguridad",
          "Un solo idioma",
          "Dominio",
          "Hosting",
          "Alta en Google negocios",
        ],
        price: "13,999",
      },
      {
        title: "Paquete de Sitio Web Pro #2",
        description:
          "Soluciones web personalizadas y a medida para tu negocio.",
        featuresOfPackage: [
          "Hasta seis páginas",
          "Adaptación de dispositivos móviles",
          "Formulario de contacto",
          "Mapa de ubicación",
          "Enlaces a redes sociales",
          "Enlace a número de WhatsApp",
          "Certificado de seguridad",
          "Un solo idioma",
          "Dominio",
          "Hosting",
          "SEO básico",
          "Alta en Google negocios",
        ],
        price: "15,999",
      },
      {
        title: "Paquete de Sitio Web Pro #3",
        description: "Sitios web de alta calidad y diseño atractivo.",
        featuresOfPackage: [
          "Hasta ocho páginas",
          "Adaptación de dispositivos móviles",
          "Formulario de contacto",
          "Mapa de ubicación",
          "Enlaces a redes sociales",
          "Enlace a número de WhatsApp",
          "Certificado de seguridad",
          "Un solo idioma",
          "Dominio",
          "Hosting",
          "SEO básico",
          "Generación de código de Google Analytics",
          "Alta en Google negocios",
        ],
        price: "17,999",
      },
    ],
  };

  const callToActionSectionInfo: ICallToActionSection = {
    image:
      "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/services/sitio-web-pro-imsoft.jpg",
    topic: "Sitio Web Pro",
    title: "Soluciones web personalizadas y a medida para tu negocio",
    description:
      "Diseñamos y desarrollamos sitios web que se adaptan a tus necesidades y a las de tu audiencia, y que reflejan la esencia de tu negocio. Además, utilizamos tecnología de vanguardia para garantizar que tu sitio web sea atractivo, responsivo y fácil de usar. Si quieres que tu negocio tenga presencia en línea y alcance nuevos clientes, no dudes en contactarme y solicitar una cotización. Con mi experiencia y conocimientos en el campo del desarrollo web, estoy seguro de que podemos ayudarte a alcanzar tus objetivos y a tener éxito en el mundo digital.",
  };

  const metatagsInfo: RequiredMetatags = {
    title: "Sitio Web Pro | imSoft",
    description: "Diseñamos y desarrollamos sitios web que se adaptan a tus necesidades y a las de tu audiencia, y que reflejan la esencia de tu negocio. Además, utilizamos tecnología de vanguardia para garantizar que tu sitio web sea atractivo, responsivo y fácil de usar. Si quieres que tu negocio tenga presencia en línea y alcance nuevos clientes, no dudes en contactarme y solicitar una cotización. Con mi experiencia y conocimientos en el campo del desarrollo web, estoy seguro de que podemos ayudarte a alcanzar tus objetivos y a tener éxito en el mundo digital",
    keywords: "Pagina Web Pro, Sitio Web Pro, imSoft",
    author: "Brandon Uriel García Ramos",
    subject: "Sitio Web Pro",
    date: dateMetatagInfo,
    type: "Sitio Web Pro",
    source: "https://www.imsoft.io/sitio-web-pro",
    image: "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/imsoft/logotipo-imsoft-cuadrado.png",
    url: "https://www.imsoft.io/sitio-web-pro",
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

        <PricesSection
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
