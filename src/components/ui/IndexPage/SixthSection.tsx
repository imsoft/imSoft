import Link from "next/link";

import { whatsappBusinessLink } from "../../../data";

export const SixthSection = () => {
  return (
    <>
      <div className="bg-primary-500">
        <div className="mx-auto max-w-2xl py-16 px-6 text-center sm:py-20 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            <span className="block">Impulsemos tu empresa</span>
            <span className="block">Cuéntanos tu siguiente gran idea</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-gray-100">
            Nuestra experiencia en el desarrollo de sitios web asegurará que su
            sitio web sea fácil de usar y se vea genial en todos los
            dispositivos.
          </p>
          <Link
            href={`${whatsappBusinessLink}`}
            target="_blank"
            className="mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-primary-500 sm:w-auto hover:bg-primary-900 hover:text-white"
          >
            Contactanos
          </Link>
        </div>
      </div>
    </>
  );
};
