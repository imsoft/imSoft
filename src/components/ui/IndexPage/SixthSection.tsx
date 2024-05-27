import { whatsappBusinessLink } from "../../../data";
import { CustomLink } from "../shared";

interface Props {
  title1: string;
  title2: string;
  description: string;
  callToAction: string;
  lang: string;
}

export const SixthSection = ({
  title1,
  title2,
  description,
  callToAction,
  lang,
}: Props) => {
  return (
    <>
      <div className="bg-primary-500">
        <div className="mx-auto max-w-2xl py-16 px-6 text-center sm:py-20 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            <span className="block">{title1}</span>
            <span className="block">{title2}</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-gray-100">{description}</p>
          <CustomLink
            href={`${whatsappBusinessLink}`}
            target="_blank"
            className="mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-primary-500 sm:w-auto hover:bg-primary-900 hover:text-white"
            lang={lang}
          >
            {callToAction}
          </CustomLink>
        </div>
      </div>
    </>
  );
};
