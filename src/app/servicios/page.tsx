import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { dateMetatagInfo } from "@/data";
import { IServiceCard, RequiredMetatags } from "@/interfaces";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Diseñamos y desarrollamos sitios web que se adaptan a tus necesidades y a las de tu audiencia, y que reflejan la esencia de tu negocio. Además, utilizamos tecnología de vanguardia para garantizar que tu sitio web sea atractivo, responsivo y fácil de usar. Si quieres que tu negocio tenga presencia en línea y alcance nuevos clientes, no dudes en contactarme y solicitar una cotización. Con mi experiencia y conocimientos en el campo del desarrollo web, estoy seguro de que podemos ayudarte a alcanzar tus objetivos y a tener éxito en el mundo digital",
  keywords:
    "Servicios, imSoft, Sitio Web, Sitios web, Pagina Web, Paginas Web, ecommerce, tienda en linea, Posicionamiento SEO",
  authors: [{ name: 'Brandon Uriel García Ramos', url: 'https://www.imsoft.io/' }],
  robots: "index,follow",
};

// const metatagsInfo: RequiredMetatags = {
//   subject: "Servicios",
//   date: dateMetatagInfo,
//   type: "Servicios",
//   source: "https://www.imsoft.io/servicios",
//   image:
//     "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/imsoft/logotipo-imsoft-cuadrado.png",
//   url: "https://www.imsoft.io/servicios",
//   robots: "index,follow",
//   _id: "",
//   tags: [],
// };

const ServicesPage = () => {
  const serviceCardInfo: IServiceCard[] = [
    {
      name: "Consultoria de sitio web 🤓",
      description:
        "Un sitio web o tienda en línea siempre cuenta con áreas de oportunidad, nosotros las ubicaremos, analizaremos y las mejoraremos para que así puedas generar mayores ganancias en tu empresa.",
      imageSrc:
        "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/services/consultoria-imSoft.jpg",
      imageAlt: "Consultoria de sitio web 🤓 - imSoft",
      href: "/servicios/consultoria",
    },
    {
      name: "Sitio Web Jr 🥇",
      description:
        "Nos aseguramos de proporcionar una solución completa y personalizada para cada uno de nuestros clientes. Diseñamos sitios web atractivos y funcionales que se adaptan a las necesidades de cada negocio o proyecto.",
      imageSrc:
        "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/services/sitio-web-jr-imsoft.jpg",
      imageAlt: "Sitio Web Jr 🥇 - imSoft",
      href: "/servicios/sitio-web-jr",
    },
    {
      name: "Sitio Web 👨‍💻",
      description:
        "Esta opción es excelente para cualquier emprendedor o empresa que quiera tener presencia en la internet, llegar a más clientes y generar más ingresos.",
      imageSrc:
        "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/services/sitio-web-imsoft.jpg",
      imageAlt: "Sitio Web 👨‍💻 - imSoft",
      href: "/servicios/sitio-web",
    },
    {
      name: "Sitio Web Pro ⚡🧑‍💻🔥",
      description:
        "Un sitio web bien administrado es el arma más poderosa de una empresa y con la utilización de estas herramientas podrás hacer de tu empresa algo más profesional.",
      imageSrc:
        "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/services/sitio-web-pro-imsoft.jpg",
      imageAlt: "Sitio Web Pro ⚡🧑‍💻🔥 - imSoft",
      href: "/servicios/sitio-web-pro",
    },
    {
      name: "E-commerce 🛍️",
      description:
        "Tu empresa tiene que modernizarse con una tienda en línea para poder llegar a clientes de todas partes, al alcance de un solo clic.",
      imageSrc:
        "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/services/tienda-en-linea-imsoft.jpg",
      imageAlt: "E-commerce 🛍️ - imSoft",
      href: "/servicios/e-commerce",
    },
    {
      name: "Posicionamiento SEO 🔝",
      description:
        "Las personas únicamente les hace caso a los primeros enlaces de Google.",
      imageSrc:
        "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/services/posicionamiento-seo-imsoft.jpg",
      imageAlt: "Posicionamiento SEO 🔝 - imSoft",
      href: "/servicios/posicionamiento-seo",
    },
    {
      name: "Aplicación Web 💻",
      description:
        "Nuestros servicios de aplicaciones web personalizadas están diseñados para ayudar a las empresas a mejorar su eficiencia al proporcionar soluciones hechas a medida.",
      imageSrc:
        "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/services/aplicacion-web-imsoft.jpg",
      imageAlt: "Aplicación Web 💻 - imSoft",
      href: "/servicios/aplicaciones-web",
    },
  ];

  const metatagsInfo: RequiredMetatags = {
    title: "Servicios | imSoft",
    description:
      "Diseñamos y desarrollamos sitios web que se adaptan a tus necesidades y a las de tu audiencia, y que reflejan la esencia de tu negocio. Además, utilizamos tecnología de vanguardia para garantizar que tu sitio web sea atractivo, responsivo y fácil de usar. Si quieres que tu negocio tenga presencia en línea y alcance nuevos clientes, no dudes en contactarme y solicitar una cotización. Con mi experiencia y conocimientos en el campo del desarrollo web, estoy seguro de que podemos ayudarte a alcanzar tus objetivos y a tener éxito en el mundo digital",
    keywords:
      "Servicios, imSoft, Sitio Web, Sitios web, Pagina Web, Paginas Web, ecommerce, tienda en linea, Posicionamiento SEO",
    author: "Brandon Uriel García Ramos",
    subject: "Servicios",
    date: dateMetatagInfo,
    type: "Servicios",
    source: "https://www.imsoft.io/servicios",
    image:
      "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/imsoft/logotipo-imsoft-cuadrado.png",
    url: "https://www.imsoft.io/servicios",
    robots: "index,follow",
    _id: "",
    tags: [],
  };

  return (
    <>
      {/* MetaEtiquetas Básicas */}
      {/* <title>{metatagsInfo.title}</title> */}
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl py-16 sm:py-24 lg:max-w-none lg:py-12">
            <h2
              id="collections-heading"
              className="text-5xl pb-8 text-center font-bold text-primary-500"
            >
              Nuestros Servicios
            </h2>

            <div className="mt-6 space-y-12 lg:grid lg:grid-cols-3 lg:gap-x-6 lg:space-y-0">
              {serviceCardInfo.map((serviceCard) => (
                <div key={serviceCard.name} className="group relative">
                  <div className="relative h-80 w-full overflow-hidden rounded-lg bg-white group-hover:opacity-75 sm:aspect-w-2 sm:aspect-h-1 sm:h-64 lg:aspect-w-1 lg:aspect-h-1">
                    <Image
                      src={serviceCard.imageSrc}
                      alt={serviceCard.imageAlt}
                      className="h-full w-full object-cover object-center"
                      width={6720}
                      height={4480}
                    />
                  </div>
                  <h3 className="mt-6 text-base font-semibold text-gray-900">
                    <Link href={serviceCard.href}>
                      <span className="absolute inset-0" />
                      {serviceCard.name}
                    </Link>
                  </h3>
                  <p className="mb-6 text-sm text-gray-500">
                    {serviceCard.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ServicesPage;
