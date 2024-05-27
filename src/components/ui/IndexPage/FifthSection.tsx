import Image from "next/image";

import { whatsappBusinessLink } from "../../../data";
import { CustomLink } from "../shared";

export interface Props {
  title: string;
  description: string;
  features: Feature[];
  callToAction1: string;
  callToAction2: string;
  lang: string;
}

export interface Feature {
  name: string;
  description: string;
}

export const FifthSection = ({
  title,
  description,
  features,
  callToAction1,
  callToAction2,
  lang,
}: Props) => {
  return (
    <>
      <div className="bg-white">
        <section aria-labelledby="features-heading" className="relative">
          <div className="h-auto w-auto aspect-w-3 aspect-h-2 overflow-hidden sm:aspect-w-5 lg:aspect-none lg:absolute lg:h-full lg:w-1/2 lg:pr-4 xl:pr-16">
            <Image
              src="https://res.cloudinary.com/https-imsoft-io/image/upload/v1706594951/imsoft-images/pictures/nuestros-valores-imsoft.jpg"
              alt="Nuestros valores - imSoft"
              className="h-full w-full object-cover object-center lg:h-full lg:w-full"
              width={869}
              height={1437}
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
                {title}
              </p>
              <p className="mt-4 text-gray-500">{description}</p>

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
                  <CustomLink
                    href={`${whatsappBusinessLink}`}
                    target="_blank"
                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-primary-500 px-8 py-3 text-base font-medium text-white hover:bg-primary-900 md:py-4 md:px-10 md:text-lg"
                    lang={lang}
                  >
                    {callToAction1}
                  </CustomLink>
                </div>
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                  <CustomLink
                    href="/servicios"
                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-primary-500 hover:bg-gray-50 md:py-4 md:px-10 md:text-lg"
                    lang={lang}
                  >
                    {callToAction2}
                  </CustomLink>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
