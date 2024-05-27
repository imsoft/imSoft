import Image from "next/image";
import { whatsappBusinessLink } from "../../../data";
import { CustomLink } from "../shared";

interface Props {
  title1: string;
  title2: string;
  description: string;
  callToAction1: string;
  callToAction2: string;
  lang: string;
}

export const ThirdSection = ({
  title1,
  title2,
  description,
  callToAction1,
  callToAction2,
  lang,
}: Props) => {
  return (
    <>
      <div className="lg:relative">
        <div className="mx-auto w-full max-w-7xl pt-16 pb-20 text-center lg:py-48 lg:text-left">
          <div className="px-6 sm:px-8 lg:w-1/2 xl:pr-16">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
              <span className="block xl:inline">{title1}</span>{" "}
              <span className="block text-primary-500 xl:inline">{title2}</span>
            </h1>
            <p className="mx-auto mt-3 max-w-md text-lg text-gray-500 sm:text-xl md:mt-5 md:max-w-3xl">
              {description}
            </p>
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
        <div className="relative h-64 w-full sm:h-72 md:h-96 lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-1/2">
          <Image
            className="absolute inset-0 h-full w-full object-cover sm:rounded-tl-lg"
            src="https://res.cloudinary.com/https-imsoft-io/image/upload/v1706594951/imsoft-images/pictures/creamos-sitios-web-para-aumentar-las-ventas-imsoft.jpg"
            alt="Diseñamos sitios web para aumentar las ventas - imSoft"
            width={547}
            height={838}
            sizes="(min-width: 1040px) 50vw, 100vw"
          />
        </div>
      </div>
    </>
  );
};
