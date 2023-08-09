import React from 'react'
import Image from "next/image";
import Link from 'next/link';

import { INotificationMessage, Services } from '../../../interfaces'

import {
    ChevronRightIcon,
    ClipboardDocumentCheckIcon,
    ComputerDesktopIcon,
    GlobeAltIcon,
    ShoppingBagIcon,
    ArrowTrendingUpIcon,
  } from "@heroicons/react/24/outline";

const links: Services[] = [
    {
      nameOfService: "Consultoria de sitio web 🤓",
      description:
        "Un sitio web o tienda en línea siempre cuenta con áreas de oportunidad, nosotros las ubicaremos, analizaremos y las mejoraremos para que así puedas generar mayores ganancias en tu empresa.",
      href: "/servicios/consultoria",
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
      nameOfService: "Sitio Web Pro ⚡🧑‍💻🔥",
      description:
        "Un sitio web bien administrado es el arma más poderosa de una empresa y con la utilización de estas herramientas podrás hacer de tu empresa algo más profesional.",
      href: "/servicios/sitio-web-pro",
      icon: GlobeAltIcon,
    },
    {
      nameOfService: "E-commerce 🛍️",
      description:
        "Tu empresa tiene que modernizarse con una tienda en línea para poder llegar a clientes de todas partes, al alcance de un solo clic.",
      href: "/servicios/e-commerce",
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

const MessageComponent = ({
    topic,
    message,
    comment,
}: INotificationMessage) => {
  return (
    <>
    <div className="bg-white">
        <main className="mx-auto w-full max-w-7xl px-6 lg:px-8">
          <div className="flex-shrink-0 pt-16">
            <Image
              className="mx-auto h-24 w-auto"
              src="https://firebasestorage.googleapis.com/v0/b/imsoft-website.appspot.com/o/Logos%20Empresa%2FimSoft_Transparente_Azul.png?alt=media&token=0a5bf3d6-641b-4d5f-8f17-45e5dab67995"
              alt="Your Company"
              height={100} width={100}
            />
          </div>
          <div className="mx-auto max-w-xl py-16 sm:pb-24">
            <div className="text-center">
              <p className="text-base font-semibold text-primary-600">{topic}</p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                {message}
              </h1>
              <p className="mt-2 text-lg text-gray-500">
                {comment}
              </p>
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
  )
}

export default MessageComponent