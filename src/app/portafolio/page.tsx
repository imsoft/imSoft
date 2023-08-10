import { PortfolioCard } from "@/components/ui/portfolio";
import { dateMetatagInfo } from "@/data";
import { IPortfolioCard, RequiredMetatags } from "@/interfaces";

const portafolio = () => {
  const portfolioInfo: IPortfolioCard[] = [
    {
      name: "Club De Estirpe",
      type: "Sitio Web 👨‍💻",
      href: "http://clubdeestirpe.com/",
      alt: "Sitio Web - Club de Estirpe - imSoft",
      imageUrl:
        "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/portfolio/website/sitio-web-club-de-estirpe-imsoft.png",
    },
    {
      name: "Construcción Inteligente",
      type: "Sitio Web 👨‍💻",
      href: "https://construccioninteligente.mx/",
      alt: "Sitio Web - Construccion Inteligente - imSoft",
      imageUrl:
        "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/portfolio/website/sitio-web-construccion-inteligente-imsoft.png",
    },
    {
      name: "Ferreacabados Jalisco",
      type: "Sitio Web 👨‍💻",
      href: "https://ferrejalisco.mx/",
      alt: "Sitio Web - Ferreacabdos Jalisco - imSoft",
      imageUrl:
        "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/portfolio/website/sitio-web-ferreacabdos-jalisco-imsoft.png",
    },
    {
      name: "Red Municipal de Abogados",
      type: "Sitio Web 👨‍💻",
      href: "https://redmunicipaldeabogados.com/",
      alt: "Sitio Web - Red Municipal de Abogados - imSoft",
      imageUrl:
        "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/portfolio/website/sitio-web-red-municipal-de-abogados-imsoft.png",
    },
    {
      name: "Unlimited Imports",
      type: "Sitio Web 👨‍💻",
      href: "https://unlimitedimports.com.mx/",
      alt: "Sitio Web - Unlimited Imports - imSoft",
      imageUrl:
        "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/portfolio/website/sitio-web-unlimited-imports-imsoft.png",
    },
    {
      name: "Santa Maria Del Oro Jalisco",
      type: "Sitio Web Pro ⚡🧑‍💻🔥",
      href: "http://santamariadelorojal.com/",
      alt: "Sitio Web Pro - Santa Maria Del Oro Jalisco - imSoft",
      imageUrl:
        "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/portfolio/website-pro/sitio-web-pro-santa-maria-del-oro-jalisco-imsoft.png",
    },
    {
      name: "San Sebastián Del Oeste",
      type: "Sitio Web Pro ⚡🧑‍💻🔥",
      href: "https://sansebastiandeloeste.gob.mx/#/",
      alt: "Sitio Web Pro - Santa Sebastian Del Oeste - imSoft",
      imageUrl:
        "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/portfolio/website-pro/sitio-web-pro-santa-sebastian-del-oeste-imsoft.png",
    },
    {
      name: "Tuxcacuesco",
      type: "Sitio Web Pro ⚡🧑‍💻🔥",
      href: "https://tuxcacuesco.gob.mx/#/",
      alt: "Sitio Web Pro - Tuxcacuesco - imSoft",
      imageUrl:
        "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/portfolio/website-pro/sitio-web-pro-tuxcacuesco-imsoft.png",
    },
    {
      name: "Pastería La Hidalguense",
      type: "Aplicación Web 🖥️📊",
      href: "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/portfolio/web-application/aplicaciones-web-pasteria-la-hidalguense-imsoft.png",
      alt: "Aplicación Web - Pastería La Hidalguense - imSoft",
      imageUrl:
        "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/portfolio/web-application/aplicaciones-web-pasteria-la-hidalguense-imsoft.png",
    },
    {
      name: "Club De Estirpe",
      type: "Aplicación Móvil 📱📊",
      href: "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/portfolio/mobile-apps/club-de-estirpe-aplicacion-movil-imsoft.png",
      alt: "Aplicación Móvil - Club De Estirpe - imSoft",
      imageUrl:
        "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/portfolio/mobile-apps/club-de-estirpe-aplicacion-movil-imsoft.png",
    },
    {
      name: "¡Contactanos!",
      type: "¡Sigues tu! 💻🏆",
      href: "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/portfolio/others/aqui-va-el-siguiente-paso-para-tu-negocio-imsoft.png",
      alt: "Contactanos - imSoft",
      imageUrl:
        "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/portfolio/others/aqui-va-el-siguiente-paso-para-tu-negocio-imsoft.png",
    },
  ];

  const metatagsInfo: RequiredMetatags = {
    title: "Portafolio de trabajo | imSoft",
    description: "Si estás buscando un profesional con experiencia y habilidades comprobadas, te invito a que visites mi portafolio de trabajo y descubras por ti mismo/a todo lo que puedo ofrecerte. Estoy seguro de que encontrarás trabajos que te sorprenderán y te mostrarán el valor que puedo aportar a tu proyecto",
    keywords: "Portafolio, imSoft",
    author: "Brandon Uriel García Ramos",
    subject: "Portafolio",
    date: dateMetatagInfo,
    type: "Portafolio",
    source: "https://www.imsoft.io/portafolio",
    image: "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/imsoft/logotipo-imsoft-cuadrado.png",
    url: "https://www.imsoft.io/portafolio",
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
        <div className="bg-white">
          <div className="mx-auto max-w-7xl py-12 px-6 lg:px-8 lg:py-24">
            <div className="space-y-12">
              <div className="space-y-5 sm:space-y-4 md:max-w-xl lg:max-w-3xl xl:max-w-none">
                <h2 className="text-3xl font-bold tracking-tight text-primary-500 sm:text-4xl">
                  Nuestros Trabajos
                </h2>
                <p className="text-xl text-gray-500">
                  Bienvenidos a nuestro portafolio de trabajos. Aquí podrán
                  encontrar una muestra de nuestros proyectos más recientes y
                  destacados en el campo del desarrollo de software. Cada uno de
                  estos proyectos ha sido realizado con dedicación y atención a
                  los detalles.
                </p>
              </div>
              <ul
                role="list"
                className="space-y-12 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 sm:space-y-0 lg:grid-cols-3 lg:gap-x-8"
              >
                {portfolioInfo.map((portfolio) => (
                  <PortfolioCard
                    key={portfolio.alt}
                    name={portfolio.name}
                    type={portfolio.type}
                    href={portfolio.href}
                    alt={portfolio.alt}
                    imageUrl={portfolio.imageUrl}
                  />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default portafolio;
