import React from "react";
import Link from "next/link";

import { IPricesSection } from "../../../interfaces";

import { CheckCircleIcon } from "@heroicons/react/24/outline";

export const MonthlyPaymentSection = ({
    topic,
    description,
    listOfPackages,
  }: IPricesSection) => {
  return (
    <>
      <div className="pt-12 sm:pt-16 lg:pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-primary-300">{topic}</h2>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Paquetes del servicio
            </h2>
            <p className="mt-4 text-xl text-gray-600">{description}</p>
          </div>
        </div>
      </div>

      {listOfPackages.map((packageFeatures) => (
        <div key={packageFeatures.title} className="mt-8 bg-white sm:mt-12">
          <div className="relative">
            <div className="absolute inset-0 h-1/2" />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-lg overflow-hidden rounded-lg drop-shadow-xl lg:flex lg:max-w-none">
                <div className="flex-1 bg-white px-6 py-8 lg:p-12">
                  <h3 className="text-2xl font-bold text-gray-900 sm:text-3xl sm:tracking-tight">
                    {packageFeatures.title}
                  </h3>
                  <p className="mt-6 text-base text-gray-500">
                    {packageFeatures.description}
                  </p>
                  <div className="mt-8">
                    <div className="flex items-center">
                      <h4 className="flex-shrink-0 bg-white pr-4 text-base font-semibold text-primary-600">
                        ¿Qué incluye?
                      </h4>
                      <div className="flex-1 border-t-2 border-gray-200" />
                    </div>
                    <ul
                      role="list"
                      className="mt-8 space-y-5 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:gap-y-5 lg:space-y-0"
                    >
                      {packageFeatures.featuresOfPackage.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start lg:col-span-1"
                        >
                          <div className="flex-shrink-0">
                            <CheckCircleIcon
                              className="h-5 w-5 text-green-400"
                              aria-hidden="true"
                            />
                          </div>
                          <p className="ml-3 text-sm text-gray-700">
                            {feature}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="bg-gray-50 py-8 px-6 text-center lg:flex lg:flex-shrink-0 lg:flex-col lg:justify-center lg:p-12">
                  <div className="mt-4 flex items-center justify-center text-5xl font-bold tracking-tight text-gray-900">
                    {/* <span>${packageFeatures.price}</span> */}
                    <span>Pregunta por <br/> tu cotización</span>
                  </div>
                  <p className="mt-4 text-sm">
                    <Link
                      href="/terminosYCondiciones"
                      className="font-medium text-gray-500 underline"
                    >
                      Términos y condiciones
                    </Link>
                  </p>
                  <div className="mt-6">
                    <div className="rounded-md shadow">
                      <Link
                        href="/contacto"
                        className="flex items-center justify-center rounded-md border border-transparent bg-primary-500 px-5 py-3 text-base font-medium text-white hover:bg-primary-900"
                      >
                        Contactanos
                      </Link>
                    </div>
                  </div>
                  <div className="mt-4 text-sm">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
