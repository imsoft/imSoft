import React from "react";
import Link from "next/link";

import { whatsappBusinessLink } from "../../../data";

export const FirstSection = () => {
  return (
    <>
      <div className="flex-1 h-64 mb-96">
        <div className="bg-gradient-to-t from-primary-50 to-primary-500 py-6">
          <div className="mx-auto max-w-7xl py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-primary-50">imSoft</h2>
              <p className="mt-1 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-8xl">
                Transformamos ideas en soluciones de software
              </p>
              <p className="mx-auto mt-5 max-w-3xl text-lg sm:text-xl text-white">
                Nuestra empresa tiene un equipo especializado y experimentado en
                desarrollo de software y podemos ayudar a alcanzar tus metas de
                negocio.
              </p>
            </div>
            <div className="mt-10 sm:flex sm:justify-center">
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
      </div>
    </>
  );
};
