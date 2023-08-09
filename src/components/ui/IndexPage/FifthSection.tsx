import React from "react";
import Image from "next/image";
import Link from "next/link";

import { whatsappBusinessLink } from "../../../data";

const features = [
  {
    name: "Innovación",
    description:
      "imSoft siempre busca nuevas formas de mejorar sus productos y servicios, además de satisfacer las necesidades de sus clientes.",
  },
  {
    name: "Trabajo en equipo",
    description:
      "Esencial para imSoft, ya que permite a los miembros del equipo compartir conocimientos, colaborar en la solución de problemas y mejorar la calidad del trabajo.",
  },
  {
    name: "Responsabilidad",
    description:
      "imSoft debe ser responsable de sus acciones, cumplir con sus obligaciones y asumir la responsabilidad de los resultados de sus productos y servicios.",
  },
  {
    name: "Mejora continua",
    description:
      "imSoft siempre busca formas de mejorar sus procesos, productos y servicios, con el objetivo de brindar un mejor servicio a sus clientes y crecer como empresa.",
  },
];

export const FifthSection = () => {
  return (
    <>
      <div className="bg-white">
        <section aria-labelledby="features-heading" className="relative">
          <div className="h-auto w-auto aspect-w-3 aspect-h-2 overflow-hidden sm:aspect-w-5 lg:aspect-none lg:absolute lg:h-full lg:w-1/2 lg:pr-4 xl:pr-16">
            <Image
              src="https://firebasestorage.googleapis.com/v0/b/imsoft-website.appspot.com/o/Fotos%20imSoft%2Fnuestros%20valores-imSoft.jpg?alt=media&token=ab50a027-2775-4242-adea-30f9c2b8af1f"
              alt="Nuestros valores - imSoft"
              className="h-full w-full object-cover object-center lg:h-full lg:w-full"
              width={5760}
              height={3840}
            />
          </div>

          <div className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 sm:pb-32 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-44">
            <div className="lg:col-start-2">
              <h2
                id="features-heading"
                className="font-medium text-primary-500"
              >
                imSoft
              </h2>
              <p className="mt-4 text-4xl font-bold tracking-tight text-gray-900">
                Nuestros valores
              </p>
              <p className="mt-4 text-gray-500">
                Esto establece las bases para una cultura empresarial positiva,
                para así garantizar la satisfacción de los clientes y el
                cumplimiento de sus necesidades.
              </p>

              <dl className="mt-10 grid grid-cols-1 gap-y-10 gap-x-8 text-sm sm:grid-cols-2">
                {features.map((feature) => (
                  <div key={feature.name}>
                    <dt className="font-medium text-gray-900">
                      {feature.name}
                    </dt>
                    <dd className="mt-2 text-gray-500">
                      {feature.description}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-10 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <Link
                    href={`${whatsappBusinessLink}`}
                    target="_blank"
                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-primary-500 px-8 py-3 text-base font-medium text-white hover:bg-primary-900 md:py-4 md:px-10 md:text-lg"
                  >
                    Contactanos
                  </Link>
                </div>
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                  <Link
                    href="/servicios"
                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-primary-500 hover:bg-gray-50 md:py-4 md:px-10 md:text-lg"
                  >
                    Servicios
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
