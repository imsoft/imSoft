import React from "react";
import Image from "next/image";
import Link from "next/link";

import { IPortfolioCard } from "../../../interfaces";

import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

export const PortfolioCard = ({
  name,
  type,
  href,
  alt,
  imageUrl,
}: IPortfolioCard) => {
  return (
    <>
      <li key={name}>
        <div className="space-y-4">
          <div className="aspect-w-3 aspect-h-2">
            <Image
              className="rounded-lg object-cover shadow-lg"
              src={imageUrl}
              alt={alt}
              width={2880}
              height={1572}
            />
          </div>
          <div className="space-y-2">
            <div className="space-y-1 text-lg font-medium leading-6">
              <Link href={href} target="_blank">
                <div className="inline-flex">
                  <h3 className="text-gray-600">{name}</h3>
                  <ArrowTopRightOnSquareIcon
                    className="ml-1 mt-1 h-4 w-4 text-gray-600"
                    aria-hidden="true"
                  />
                </div>
              </Link>
              <p className="text-primary-600 text-xs">{type}</p>
            </div>
          </div>
        </div>
      </li>
    </>
  );
};
