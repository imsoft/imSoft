import Link from "next/link";

import { Services } from "../../../interfaces";

import {
  CircleStackIcon,
  CodeBracketSquareIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  MagnifyingGlassIcon,
  MegaphoneIcon,
  PresentationChartBarIcon,
  ShoppingBagIcon,
  Square3Stack3DIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

const infoServices: Services[] = [
  {
    nameOfService: "Consultoría de sitio web 🤓",
    description: "Mejoramos tu sitio para aumentar ganancias.",
    href: "/servicios/consultoria-web",
    icon: PresentationChartBarIcon,
  },
  {
    nameOfService: "Sitio Web 👨‍💻",
    description: "Presencia online para atraer más clientes y generar ingresos.",
    href: "/servicios/sitio-web",
    icon: CodeBracketSquareIcon,
  },
  {
    nameOfService: "Tienda en línea 🛍️",
    description: "Vende en línea y alcanza clientes globalmente.",
    href: "/servicios/tienda-en-linea",
    icon: ShoppingBagIcon,
  },
  {
    nameOfService: "Posicionamiento SEO 🔝",
    description: "Posiciona tu sitio en los primeros lugares de Google.",
    href: "/servicios/posicionamiento-seo",
    icon: MagnifyingGlassIcon,
  },
  {
    nameOfService: "Aplicación Web 💻",
    description: "Soluciones web personalizadas para mejorar eficiencia.",
    href: "/servicios/aplicaciones-web",
    icon: ComputerDesktopIcon,
  },
  {
    nameOfService: "Análisis de datos 📊",
    description: "Convierte datos en insights para decisiones informadas.",
    href: "/servicios/analisis-de-datos",
    icon: CircleStackIcon,
  },
  {
    nameOfService: "Aplicaciones Móviles 📱",
    description: "Aplicaciones que reflejan tu marca y enganchan usuarios.",
    href: "/servicios/aplicaciones-moviles",
    icon: DevicePhoneMobileIcon,
  },
  {
    nameOfService: "Campañas de redes sociales 📲",
    description: "Conecta efectivamente con tu audiencia online.",
    href: "/servicios/campanas-en-redes-sociales",
    icon: MegaphoneIcon,
  },
  {
    nameOfService: "Gestión de redes sociales 🖼️",
    description: "Estrategias para destacar y crecer tu comunidad.",
    href: "/servicios/gestion-de-redes-sociales",
    icon: UsersIcon,
  },
  {
    nameOfService: "Campañas de Google Ads 📣",
    description: "Maximiza tu visibilidad online y atrae a tu público.",
    href: "/servicios/campanas-en-google-ads",
    icon: Square3Stack3DIcon,
  },
];

export const FourthSection = () => {
  return (
    <>
      <div className="bg-primary-500">
        <div className="mx-auto max-w-4xl px-6 py-24 sm:py-32 lg:max-w-7xl lg:px-8 lg:py-40">
          <h2 className="text-4xl font-bold tracking-tight text-white">
            Nuestros Servicios
          </h2>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white">
            Nuestra metodología de trabajo es colaborativa, trabajamos de la
            mano con nuestros clientes para asegurar que el software cumpla con
            sus objetivos de negocio.
          </p>
          <div className="mt-20 grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-5 lg:gap-x-8 lg:gap-y-16">
            {infoServices.map((service) => (
              <div key={service.nameOfService}>
                <div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white bg-opacity-10">
                    <service.icon
                      className="h-8 w-8 text-white"
                      width={200}
                      height={200}
                      aria-hidden="true"
                      aria-describedby={`${service.nameOfService}`}
                    />
                  </span>
                </div>
                <div className="mt-6">
                  <Link href={service.href}>
                    <h3 className="flex items-center text-lg font-semibold leading-8 text-white">
                      {service.nameOfService}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 192 192"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 text-white ml-1"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                        />
                      </svg>
                    </h3>
                  </Link>
                  <p className="mt-2 text-base leading-7 text-white">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
