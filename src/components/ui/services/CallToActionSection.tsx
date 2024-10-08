import Image from "next/image";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { CustomLink } from "../shared";

interface Props {
  imageUrl: string;
  topic: string;
  title: string;
  description: string;
  callToAction: string;
  lang: string;
}

export const CallToActionSection = ({
  imageUrl,
  topic,
  title,
  description,
  callToAction,
  lang,
}: Props) => {
  return (
    <>
      <div className="relative bg-primary-500 mt-20">
        <div className="h-56 bg-primary-600 sm:h-72 md:absolute md:left-0 md:h-full md:w-1/2">
          <Image
            className="h-full w-full object-cover"
            src={imageUrl}
            alt={topic}
            width={595}
            height={438}
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="md:ml-auto md:w-1/2 md:pl-10">
            <h2 className="text-lg font-semibold text-gray-100">{topic}</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {title}
            </p>
            <p className="mt-3 text-lg text-gray-100">{description}</p>
            <div className="mt-8">
              <div className="group inline-flex rounded-md shadow">
                <CustomLink
                  href="/contacto"
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-gray-500 hover:bg-primary-900 group-hover:text-white"
                  lang={lang}
                >
                  {callToAction}
                  <ArrowTopRightOnSquareIcon
                    className="-mr-1 ml-3 h-5 w-5 text-gray-400 group-hover:text-white"
                    aria-hidden="true"
                  />
                </CustomLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
