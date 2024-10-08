import Image from "next/image";
import Link from "next/link";

import type { HeroIcon, NotificationMessage } from "../../../interfaces";

import {
  ChevronRightIcon,
  ClipboardDocumentCheckIcon,
  ComputerDesktopIcon,
  ShoppingBagIcon,
  ArrowTrendingUpIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";

interface Services {
  nameOfService: string;
  description: string;
  href: string;
  icon: HeroIcon;
}

const links: Services[] = [
  {
    nameOfService: "Consultoria de sitio web 🤓",
    description:
      "Un sitio web o tienda en línea siempre cuenta con áreas de oportunidad, nosotros las ubicaremos, analizaremos y las mejoraremos para que así puedas generar mayores ganancias en tu empresa.",
    href: "/servicios/consultoria-web",
    icon: ClipboardDocumentCheckIcon,
  },
  {
    nameOfService: "Sitio Web 👨‍💻",
    description:
      "Esta opción es excelente para cualquier emprendedor o empresa que quiera tener presencia en la internet, llegar a más clientes y generar más ingresos.",
    href: "/servicios/sitio-web",
    icon: ComputerDesktopIcon,
  },
  {
    nameOfService: "Aplicaciones Móviles 📱",
    description:
      "Creación de aplicaciones móviles a medida que capturan la esencia de tu marca y conectan con tus usuarios de manera significativa.",
    href: "/servicios/aplicaciones-moviles",
    icon: DevicePhoneMobileIcon,
  },
  {
    nameOfService: "Tienda en línea 🛍️",
    description:
      "Tu empresa tiene que modernizarse con una tienda en línea para poder llegar a clientes de todas partes, al alcance de un solo clic.",
    href: "/servicios/tienda-en-linea",
    icon: ShoppingBagIcon,
  },
  {
    nameOfService: "Posicionamiento SEO 🔝",
    description:
      "Las personas únicamente les hace caso a los primeros enlaces de Google.",
    href: "/servicios/posicionamiento-seo",
    icon: ArrowTrendingUpIcon,
  },
];

const MessageComponent = ({ topic, message, comment }: NotificationMessage) => {
  return (
    <>
      <div className="bg-white">
        <main className="mx-auto w-full max-w-7xl px-6 lg:px-8">
          <div className="flex-shrink-0 pt-16">
            <Image
              className="mx-auto h-24 w-auto"
              src="https://res.cloudinary.com/https-imsoft-io/image/upload/v1706594671/imsoft-images/imsoft/logotipo-imsoft-transparente-azul-rectangular.png"
              alt="imSoft"
              height={650}
              width={650}
            />
          </div>
          <div className="mx-auto max-w-xl py-16 sm:pb-24">
            <div className="text-center">
              <p className="text-base font-semibold text-primary-600">
                {topic}
              </p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                {message}
              </h1>
              <p className="mt-2 text-lg text-gray-500">{comment}</p>
            </div>
            <div className="mt-12">
              <h2 className="text-base font-semibold text-gray-500">
                Páginas más populares
              </h2>
              <ul
                role="list"
                className="mt-4 divide-y divide-gray-200 border-t border-b border-gray-200"
              >
                {links.map((link, linkIdx) => (
                  <li
                    key={linkIdx}
                    className="relative flex items-start space-x-4 py-6"
                  >
                    <div className="flex-shrink-0">
                      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50">
                        <link.icon
                          className="h-6 w-6 text-primary-700"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-medium text-gray-900">
                        <span className="rounded-sm focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2">
                          <Link href={link.href} className="focus:outline-none">
                            <span
                              className="absolute inset-0"
                              aria-hidden="true"
                            />
                            {link.nameOfService}
                          </Link>
                        </span>
                      </h3>
                      <p className="text-base text-gray-500">
                        {link.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0 self-center">
                      <ChevronRightIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  href="/"
                  className="text-base font-medium text-primary-600 hover:text-primary-500"
                >
                  Regresar al inicio
                  <span aria-hidden="true"> &rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default MessageComponent;
