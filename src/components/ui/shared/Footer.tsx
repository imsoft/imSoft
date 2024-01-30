import Image from "next/image";
import Link from "next/link";

import { IFooter } from "../../../interfaces";
import SocialMediaBar from "./SocialMediaBar";
import ContactInfo from "./ContactInfo";

const footerNavigation: IFooter = {
  services: [
    { name: "Consultoría de sitio web 🤓", href: "/servicios/consultoria-web" },
    { name: "Sitio Web Básico 🥇", href: "/servicios/sitio-web-basico" },
    { name: "Sitio Web 👨‍💻", href: "/servicios/sitio-web" },
    { name: "Sitio Web Pro ⚡🧑‍💻🔥", href: "/servicios/sitio-web-pro" },
    { name: "Tienda en línea 🛍️", href: "/servicios/tienda-en-linea" },
    { name: "Posicionamiento SEO 🔝", href: "/servicios/posicionamiento-seo" },
    { name: "Aplicación Web 💻", href: "/servicios/aplicaciones-web" },
  ],
  company: [
    { name: "Historia de imSoft", href: "/nosotros" },
    { name: "Clientes", href: "/portafolio" },
    { name: "¿Tienes alguna duda?", href: "/contacto" },
  ],
  articles: [{ name: "Nuestros Artículos", href: "/articulos" }],
  legal: [{ name: "Aviso de privacidad", href: "/avisoDePrivacidad" }],
};

export const Footer = () => {
  return (
    <>
      <footer className="bg-white" aria-labelledby="footer-heading">
        <h2 id="footer-heading" className="sr-only">
          Footer
        </h2>
        <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8 xl:col-span-1">
              <Image
                className="h-auto w-auto"
                src="https://res.cloudinary.com/https-imsoft-io/image/upload/v1706594671/imsoft-images/imsoft/logotipo-imsoft-transparente-azul-rectangular.png"
                alt="imSoft"
                width={128}
                height={46}
              />
              <p className="text-base text-gray-500">
                Soluciones de software a medida para empresas innovadoras.
              </p>

              <ContactInfo textStyle={"text-gray-500"} />

              <SocialMediaBar
                iconStyle={"text-gray-400 hover:text-primary-500"}
              />
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-base font-medium text-primary-500">
                    Servicios
                  </h3>
                  <ul role="list" className="mt-4 space-y-4">
                    {footerNavigation.services.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="text-base text-gray-500 hover:text-gray-900"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-base font-medium text-primary-500">
                    Empresa
                  </h3>
                  <ul role="list" className="mt-4 space-y-4">
                    {footerNavigation.company.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="text-base text-gray-500 hover:text-gray-900"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-base font-medium text-primary-500">
                    Artículos
                  </h3>
                  <ul role="list" className="mt-4 space-y-4">
                    {footerNavigation.articles.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="text-base text-gray-500 hover:text-gray-900"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-base font-medium text-primary-500">
                    Legal
                  </h3>
                  <ul role="list" className="mt-4 space-y-4">
                    {footerNavigation.legal.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="text-base text-gray-500 hover:text-gray-900"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-200 pt-8">
            <p className="text-base text-gray-400 xl:text-center">
              &copy; 2024 imSoft. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};
