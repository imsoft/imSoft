import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IServiceCard } from "@/interfaces";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Diseñamos y desarrollamos sitios web que se adaptan a tus necesidades y a las de tu audiencia, y que reflejan la esencia de tu negocio. Además, utilizamos tecnología de vanguardia para garantizar que tu sitio web sea atractivo, responsivo y fácil de usar. Si quieres que tu negocio tenga presencia en línea y alcance nuevos clientes, no dudes en contactarme y solicitar una cotización. Con mi experiencia y conocimientos en el campo del desarrollo web, estoy seguro de que podemos ayudarte a alcanzar tus objetivos y a tener éxito en el mundo digital",
  keywords: [
    "imSoft",
    "Servicios",
    "Clientes",
    "Clientes satisfechos",
    "Sitio web",
    "Aplicación web",
    "Ecommerce",
    "SEO",
    "Consultoria",
  ],
  twitter: {
    title: "Servicios",
    description:
      "Diseñamos y desarrollamos sitios web que se adaptan a tus necesidades y a las de tu audiencia, y que reflejan la esencia de tu negocio. Además, utilizamos tecnología de vanguardia para garantizar que tu sitio web sea atractivo, responsivo y fácil de usar. Si quieres que tu negocio tenga presencia en línea y alcance nuevos clientes, no dudes en contactarme y solicitar una cotización. Con mi experiencia y conocimientos en el campo del desarrollo web, estoy seguro de que podemos ayudarte a alcanzar tus objetivos y a tener éxito en el mundo digital",
  },
  openGraph: {
    title: "Servicios",
    description:
      "Diseñamos y desarrollamos sitios web que se adaptan a tus necesidades y a las de tu audiencia, y que reflejan la esencia de tu negocio. Además, utilizamos tecnología de vanguardia para garantizar que tu sitio web sea atractivo, responsivo y fácil de usar. Si quieres que tu negocio tenga presencia en línea y alcance nuevos clientes, no dudes en contactarme y solicitar una cotización. Con mi experiencia y conocimientos en el campo del desarrollo web, estoy seguro de que podemos ayudarte a alcanzar tus objetivos y a tener éxito en el mundo digital",
  },
};

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

const ServicesPage = () => {
  return (
    <>
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
                      width={359}
                      height={256}
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
