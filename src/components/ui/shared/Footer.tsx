import Image from "next/image";
import Link from "next/link";

import SocialMediaBar from "./SocialMediaBar";
import ContactInfo from "./ContactInfo";
import { CustomLink } from "./CustomLink";

export interface FooterProps {
  description: string;
  firstColumn: Column;
  secondColumn: Column;
  thirdColumn: Column;
  fourthColumn: Column;
  copyRight: string;
  lang: string;
}

export interface Column {
  title: string;
  links: Link[];
}

export interface Link {
  name: string;
  href: string;
}

export const Footer = ({
  description,
  firstColumn,
  secondColumn,
  thirdColumn,
  fourthColumn,
  copyRight,
  lang,
}: FooterProps) => {
  return (
    <>
      <footer className="bg-white" aria-labelledby="footer-heading">
        <h2 id="footer-heading" className="sr-only">
          Footer
        </h2>
        <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8 xl:col-span-1">
              <Image
                className="h-auto w-auto"
                src="https://res.cloudinary.com/https-imsoft-io/image/upload/v1706594671/imsoft-images/imsoft/logotipo-imsoft-transparente-azul-rectangular.png"
                alt="imSoft"
                width={128}
                height={46}
              />
              <p className="text-base text-gray-500">{description}</p>

              <ContactInfo textStyle={"text-gray-500"} lang={lang} />

              <SocialMediaBar
                iconStyle={"text-gray-400 hover:text-primary-500"}
              />
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-base font-medium text-primary-500">
                    {firstColumn.title}
                  </h3>
                  <ul role="list" className="mt-4 space-y-4">
                    {firstColumn.links.map((item) => (
                      <li key={item.name}>
                        <CustomLink
                          href={`/${lang}/${item.href}`}
                          className="text-base text-gray-500 hover:text-gray-900"
                          lang={lang}
                        >
                          {item.name}
                        </CustomLink>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-base font-medium text-primary-500">
                    {secondColumn.title}
                  </h3>
                  <ul role="list" className="mt-4 space-y-4">
                    {secondColumn.links.map((item) => (
                      <li key={item.name}>
                        <CustomLink
                          href={`/${lang}/${item.href}`}
                          className="text-base text-gray-500 hover:text-gray-900"
                          lang={lang}
                        >
                          {item.name}
                        </CustomLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-base font-medium text-primary-500">
                    {thirdColumn.title}
                  </h3>
                  <ul role="list" className="mt-4 space-y-4">
                    {thirdColumn.links.map((item) => (
                      <li key={item.name}>
                        <CustomLink
                          href={`/${lang}/${item.href}`}
                          className="text-base text-gray-500 hover:text-gray-900"
                          lang={lang}
                        >
                          {item.name}
                        </CustomLink>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-base font-medium text-primary-500">
                    {fourthColumn.title}
                  </h3>
                  <ul role="list" className="mt-4 space-y-4">
                    {fourthColumn.links.map((item) => (
                      <li key={item.name}>
                        <CustomLink
                          href={`/${lang}/${item.href}`}
                          className="text-base text-gray-500 hover:text-gray-900"
                          lang={lang}
                        >
                          {item.name}
                        </CustomLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-200 pt-8">
            <p className="text-base text-gray-400 xl:text-center">
              &copy; {copyRight}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};
