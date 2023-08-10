import Image from "next/image";
import { dateMetatagInfo } from "@/data";
import { RequiredMetatags } from "@/interfaces";

const nosotros = () => {
  const metatagsInfo: RequiredMetatags = {
    title: "Nosotros | imSoft",
    description: "¿Buscas una empresa experta en software y tecnología para desarrollar tu próximo proyecto? ¡ImSoft es tu mejor opción! Somos una empresa líder en el mercado, especializada en soluciones de software y tecnología para satisfacer las necesidades de nuestros clientes",
    keywords: "Nosotros, imSoft",
    author: "Brandon Uriel García Ramos",
    subject: "Nosotros",
    date: dateMetatagInfo,
    type: "Nosotros",
    source: "https://www.imsoft.io/nosotros",
    image: "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/imsoft/logotipo-imsoft-cuadrado.png",
    url: "https://www.imsoft.io/nosotros",
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
        <div className="relative bg-white">
          <div className="lg:absolute lg:inset-0">
            <div className="lg:absolute lg:inset-y-0 lg:left-0 lg:w-1/2">
              <Image
                className="h-56 w-full object-cover rounded-br-lg lg:absolute lg:h-full"
                src="https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/pictures/nosotros-imsoft.jpg"
                alt="Nosotros - imSoft"
                width={1004}
                height={224}
              />
            </div>
          </div>
          <div className="relative px-4 pt-12 pb-16 sm:px-6 sm:pt-16 lg:mx-auto lg:grid lg:max-w-7xl lg:grid-cols-2 lg:px-8">
            <div className="lg:col-start-2 lg:pl-8">
              <div className="mx-auto max-w-prose text-base lg:ml-auto lg:mr-0 lg:max-w-lg">
                <h2 className="font-semibold leading-6 text-primary-600">
                  Trabajemos juntos
                </h2>
                <h3 className="mt-2 text-3xl font-bold leading-8 tracking-tight text-gray-900 sm:text-4xl">
                  Nosotros
                </h3>
                <p className="mt-8 text-lg text-gray-500">
                  Siempre hemos sido apasionados por la tecnología y la
                  informática. Después de graduarnos de la universidad con
                  títulos en ingeniería informática, comenzamos a trabajar en
                  una empresa de desarrollo de software, pero siempre hemos
                  soñado con tener nuestra propia empresa.
                </p>
                <p className="mt-8 text-lg text-gray-500">
                  Con el tiempo, nos dimos cuenta de que teníamos una habilidad
                  especial para entender las necesidades de nuestros clientes y
                  crear soluciones de software personalizadas que se adaptaran a
                  ellas. Así que, con un poco de valentía y mucho trabajo duro,
                  decidimos lanzar nuestra propia empresa de desarrollo de
                  software llamada &quot;
                  <span className="text-primary-500">imSoft</span>&quot;.
                </p>
                <p className="mt-8 text-lg text-gray-500">
                  A pesar de que el camino no ha sido fácil, nos hemos mantenido
                  motivados gracias a nuestra pasión por la tecnología y nuestro
                  deseo de ayudar a nuestros clientes a tener éxito. Con nuestra
                  dedicación y nuestra creatividad, pronto nos convertimos en
                  una de las empresas de desarrollo de software más confiables
                  para nuestros clientes.
                </p>
                <p className="mt-8 text-lg text-gray-500">
                  Nuestros clientes quedaron impresionados por la calidad de
                  nuestro trabajo y nuestro compromiso con la satisfacción del
                  cliente. Muchos de ellos se convirtieron en leales seguidores
                  de
                  <span className="text-primary-500"> imSoft</span>, y la
                  empresa comenzó a crecer rápidamente.
                </p>
                <p className="mt-8 text-lg text-gray-500">
                  Hoy en día, <span className="text-primary-500">imSoft</span>{" "}
                  es conocida como una empresa de desarrollo de software de alta
                  calidad y con un servicio excepcional. Nos mantenemos tan
                  apasionados como el primer día por ayudar a nuestros clientes
                  a tener éxito a través de soluciones de software
                  personalizadas y de alta calidad. ¡Si estás buscando una
                  empresa de desarrollo de software confiable y motivada,
                  <span className="text-primary-500"> imSoft</span> es la opción
                  perfecta para ti!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default nosotros;
