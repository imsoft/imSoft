import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IServiceCard } from "@/interfaces";

export const metadata: Metadata = {
  title: "Servicios de Desarrollo Web en CDMX | imSoft",
  description: "En imSoft ofrecemos servicios de diseño y desarrollo web personalizados en CDMX. Creamos sitios web responsivos, atractivos y optimizados para SEO, asegurando la mejor presencia online para tu negocio. Contáctanos para transformar tus ideas en una realidad digital exitosa.",
  keywords: [
    "Desarrollo Web CDMX",
    "Diseño Web en CDMX",
    "Servicios Web CDMX",
    "Creación de Sitios Web CDMX",
    "Ecommerce CDMX",
    "SEO CDMX",
    "Consultoría Web CDMX",
    "Agencia Web CDMX",
    "Desarrollo de Aplicaciones CDMX",
  ],
  twitter: {
    title: "Desarrollo y Diseño Web en CDMX | imSoft",
    description: "Transforma tu negocio con nuestros servicios de desarrollo y diseño web en CDMX. Sitios web personalizados, optimizados para SEO y listos para competir en el mercado digital. ¡Contáctanos y empieza tu proyecto hoy!",
  },
  openGraph: {
    title: "Servicios de Desarrollo Web en CDMX | imSoft",
    description: "Potencia tu negocio en línea con soluciones web a medida en CDMX. En imSoft, ofrecemos diseño, desarrollo, SEO y más para asegurar el éxito de tu proyecto en internet. Contáctanos para saber más.",
  },
};

const serviceCardInfo: IServiceCard[] = [
  {
    name: "Consultoria de sitio web en CDMX 🤓",
    description:
      "Un sitio web o tienda en línea siempre cuenta con áreas de oportunidad, nosotros las ubicaremos, analizaremos y las mejoraremos para que así puedas generar mayores ganancias en tu empresa.",
    imageSrc:
      "https://res.cloudinary.com/https-imsoft-io/image/upload/v1706595026/imsoft-images/services/consultoria-imSoft.jpg",
    imageAlt: "Consultoria de sitio web en CDMX 🤓 - imSoft",
    href: "/servicios/consultoria-web",
  },
  {
    name: "Sitio Web en CDMX 👨‍💻",
    description:
      "Esta opción es excelente para cualquier emprendedor o empresa que quiera tener presencia en la internet, llegar a más clientes y generar más ingresos.",
    imageSrc:
      "https://res.cloudinary.com/https-imsoft-io/image/upload/v1706595026/imsoft-images/services/sitio-web-imsoft.jpg",
    imageAlt: "Sitio Web en CDMX 👨‍💻 - imSoft",
    href: "/servicios/sitio-web",
  },
  {
    name: "Tienda en línea en CDMX 🛍️",
    description:
      "Tu empresa tiene que modernizarse con una tienda en línea para poder llegar a clientes de todas partes, al alcance de un solo clic.",
    imageSrc:
      "https://res.cloudinary.com/https-imsoft-io/image/upload/v1706595027/imsoft-images/services/tienda-en-linea-imsoft.jpg",
    imageAlt: "Tienda en línea en CDMX 🛍️ - imSoft",
    href: "/servicios/tienda-en-linea",
  },
  {
    name: "Posicionamiento SEO en CDMX 🔝",
    description:
      "Las personas únicamente les hace caso a los primeros enlaces de Google.",
    imageSrc:
      "https://res.cloudinary.com/https-imsoft-io/image/upload/v1706595026/imsoft-images/services/posicionamiento-seo-imsoft.jpg",
    imageAlt: "Posicionamiento SEO en CDMX 🔝 - imSoft",
    href: "/servicios/posicionamiento-seo",
  },
  {
    name: "Aplicación Web en CDMX 💻",
    description:
      "Nuestros servicios de aplicaciones web personalizadas están diseñados para ayudar a las empresas a mejorar su eficiencia al proporcionar soluciones hechas a medida.",
    imageSrc:
      "https://res.cloudinary.com/https-imsoft-io/image/upload/v1706595026/imsoft-images/services/aplicacion-web-imsoft.jpg",
    imageAlt: "Aplicación Web en CDMX 💻 - imSoft",
    href: "/servicios/aplicaciones-web",
  },
  {
    name: "Análisis de datos en CDMX 📊",
    description:
      "Ofrecemos servicios de análisis de datos de vanguardia para convertir tus grandes volúmenes de información en insights accionables.",
    imageSrc:
      "https://res.cloudinary.com/https-imsoft-io/image/upload/v1706898185/imsoft-images/services/analisis-de-datos-imsoft.jpg",
    imageAlt: "Análisis de datos en CDMX 📊 - imSoft",
    href: "/servicios/analisis-de-datos",
  },
  {
    name: "Aplicaciones Móviles en CDMX 📱",
    description:
      "Creación de aplicaciones móviles a medida que capturan la esencia de tu marca y conectan con tus usuarios de manera significativa.",
    imageSrc:
      "https://res.cloudinary.com/https-imsoft-io/image/upload/v1706898396/imsoft-images/services/aplicaciones-moviles-imsoft.jpg",
    imageAlt: "Aplicaciones Móviles en CDMX 📱 - imSoft",
    href: "/servicios/aplicaciones-moviles",
  },
  {
    name: "Campañas de redes sociales en CDMX 📲",
    description:
      "Impulsa tu presencia en línea y conecta de manera más efectiva con tu audiencia a través de nuestras campañas de redes sociales estratégicamente diseñadas.",
    imageSrc:
      "https://res.cloudinary.com/https-imsoft-io/image/upload/v1706899599/imsoft-images/services/campan%CC%83as-de-redes-sociales-imsoft.jpg",
    imageAlt: "Campañas de redes sociales en CDMX 📲 - imSoft",
    href: "/servicios/campanas-en-redes-sociales",
  },
  {
    name: "Gestión de redes sociales en CDMX 🖼️",
    description:
      "Desde la creación de contenido atractivo hasta la estrategia de publicación y análisis de rendimiento, nos aseguramos de que tu marca no solo sea vista, sino también escuchada y seguida.",
    imageSrc:
      "https://res.cloudinary.com/https-imsoft-io/image/upload/v1706899598/imsoft-images/services/gestion-de-redes-sociales-imsoft.jpg",
    imageAlt: "Gestión de redes sociales en CDMX 🖼️ - imSoft",
    href: "/servicios/gestion-de-redes-sociales",
  },
  {
    name: "Campañas de Google Ads en CDMX 📣",
    description:
      "Nuestro servicio de gestión de campañas en Google Ads te ayuda a maximizar tu presencia en línea y atraer a tu audiencia objetivo de manera eficiente.",
    imageSrc:
      "https://res.cloudinary.com/https-imsoft-io/image/upload/v1706902047/imsoft-images/services/campan%CC%83as-google-ads-imsoft.jpg",
    imageAlt: "Campañas de Google Ads en CDMX 📣 - imSoft",
    href: "/servicios/campanas-en-google-ads",
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
              Nuestros Servicios en CDMX
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
