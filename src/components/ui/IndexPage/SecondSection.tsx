import React from "react";

export const SecondSection = () => {
  return (
    <>
      <div className="pt-12 sm:pt-16 md:pt-36">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Hoy inicia el gran cambio para tu empresa
            </h2>
            <p className="mt-3 text-xl text-gray-500 sm:mt-4">
              Escucharemos todas tus ideas y las haremos realidad, sin perder la
              escencia de tu empresa
            </p>
          </div>
        </div>
        <div className="mt-10 bg-white pb-12 sm:pb-16">
          <div className="relative">
            <div className="absolute inset-0 h-1/2" />
            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-4xl">
                <dl className="rounded-lg bg-white shadow-lg sm:grid sm:grid-cols-3">
                  <div className="flex flex-col border-b border-gray-100 p-6 text-center sm:border-0 sm:border-r">
                    <dt className="order-2 mt-2 text-lg font-medium leading-6 text-gray-500">
                      Satisfacción
                    </dt>
                    <dd className="order-1 text-5xl font-bold tracking-tight text-primary-500">
                      100%
                    </dd>
                  </div>
                  <div className="flex flex-col border-t border-b border-gray-100 p-6 text-center sm:border-0 sm:border-l sm:border-r">
                    <dt className="order-2 mt-2 text-lg font-medium leading-6 text-gray-500">
                      Proyectos
                    </dt>
                    <dd className="order-1 text-5xl font-bold tracking-tight text-primary-500">
                      +10
                    </dd>
                  </div>
                  <div className="flex flex-col border-t border-gray-100 p-6 text-center sm:border-0 sm:border-l">
                    <dt className="order-2 mt-2 text-lg font-medium leading-6 text-gray-500">
                      Servicios para ti
                    </dt>
                    <dd className="order-1 text-5xl font-bold tracking-tight text-primary-500">
                      +7
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
