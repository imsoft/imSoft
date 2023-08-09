import React from "react";
import Link from "next/link";

import { whatsappBusinessLink } from "../../../data";

export const ConversionBar = () => {
  return (
    <>
      <div className="md:flex md:justify-around bg-primary-500 py-1.5">
        <div className="">
          <h5 className="flex justify-center items-center text-white font-medium">
            ¡Bienvenido a imSoft 👨‍💻!
          </h5>
        </div>
        <div className="">
          <Link
            href={`${whatsappBusinessLink}`}
            target="_blank"
            className="flex justify-center items-center gap-2"
          >
            <h5 className="text-white">Contactate con nosotros</h5>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
          </Link>
        </div>
      </div>
    </>
  );
};
