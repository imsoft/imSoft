import Image from "next/image";

import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { CustomLink } from "../shared";

interface PortfolioCardProps {
  name: string;
  type: string;
  href: string;
  alt: string;
  imageUrl: string;
  lang: string;
}

export const PortfolioCard = ({
  name,
  type,
  href,
  alt,
  imageUrl,
  lang,
}: PortfolioCardProps) => {
  return (
    <>
      <li key={name}>
        <div className="space-y-4">
          <div className="aspect-w-3 aspect-h-2">
            <Image
              className="rounded-lg object-cover shadow-lg"
              src={imageUrl}
              alt={alt}
              width={354}
              height={193}
            />
          </div>
          <div className="space-y-2">
            <div className="space-y-1 text-lg font-medium leading-6">
              <CustomLink href={href} lang={lang} target="_blank">
                <div className="inline-flex">
                  <h3 className="text-gray-600">{name}</h3>
                  <ArrowTopRightOnSquareIcon
                    className="ml-1 mt-1 h-4 w-4 text-gray-600"
                    aria-hidden="true"
                  />
                </div>
              </CustomLink>
              <p className="text-primary-600 text-xs">{type}</p>
            </div>
          </div>
        </div>
      </li>
    </>
  );
};
