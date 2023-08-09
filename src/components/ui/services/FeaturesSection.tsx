import React from "react";

import { IFeaturesSection } from "../../../interfaces";

export const FeaturesSection = ({
  topic,
  title,
  description,
  serviceFeatures,
}: IFeaturesSection) => {
  return (
    <>
      <div className="relative bg-primary-500 py-16">
        <div className="mx-auto max-w-md px-6 text-center sm:max-w-3xl lg:max-w-7xl lg:px-8">
          <h2 className="text-lg font-semibold text-primary-300">{topic}</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-100 sm:text-4xl">
            {title}
          </p>
          <p className="mx-auto mt-5 max-w-prose text-xl text-gray-200">
            {description}
          </p>
          <div className="mt-20 drop-shadow-2xl">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {serviceFeatures.map((service) => (
                <div key={service.title} className="pt-6">
                  <div className="flow-root rounded-lg bg-gray-50 px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center rounded-xl bg-primary-300 p-3 shadow-lg">
                          <service.icon
                            className="h-8 w-8 text-white"
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-semibold leading-8 tracking-tight text-gray-600">
                        {service.title}
                      </h3>
                      <p className="mt-5 text-base leading-7 text-gray-500">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
