import Image from "next/image";
import { Metadata } from "next";
import { Locale } from "../../../../i18n.config";
import { getDictionary } from "@/lib/dictionary";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "¿Buscas una empresa experta en software y tecnología para desarrollar tu próximo proyecto? ¡ImSoft es tu mejor opción! Somos una empresa líder en el mercado, especializada en soluciones de software y tecnología para satisfacer las necesidades de nuestros clientes",
  keywords: [
    "imSoft",
    "Tecnología",
    "Informática",
    "Ingeniería informática",
    "Empresa de desarrollo de software",
    "Soluciones de software personalizadas",
    "Desarrollo de software",
    "Clientes",
    "Satisfacción del cliente",
    "Empresa de desarrollo de software de alta calidad",
    "Servicio excepcional",
    "Soluciones de software personalizadas y de alta calidad",
  ],
  twitter: {
    title: "Nosotros",
    description:
      "¿Buscas una empresa experta en software y tecnología para desarrollar tu próximo proyecto? ¡ImSoft es tu mejor opción! Somos una empresa líder en el mercado, especializada en soluciones de software y tecnología para satisfacer las necesidades de nuestros clientes",
  },
  openGraph: {
    title: "Nosotros",
    description:
      "¿Buscas una empresa experta en software y tecnología para desarrollar tu próximo proyecto? ¡ImSoft es tu mejor opción! Somos una empresa líder en el mercado, especializada en soluciones de software y tecnología para satisfacer las necesidades de nuestros clientes",
  },
};

const AboutUsPage = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}) => {
  const { page } = await getDictionary(lang);
  return (
    <>
      <main>
        <div className="relative bg-white">
          <div className="lg:absolute lg:inset-0">
            <div className="lg:absolute lg:inset-y-0 lg:left-0 lg:w-1/2">
              <Image
                className="h-56 w-full object-cover rounded-br-lg lg:absolute lg:h-full"
                src="https://res.cloudinary.com/https-imsoft-io/image/upload/v1706594951/imsoft-images/pictures/nosotros-imsoft.jpg"
                alt="Nosotros - imSoft"
                width={1004}
                height={224}
              />
            </div>
          </div>
          <div className="relative px-4 pt-12 pb-16 sm:px-6 sm:pt-16 lg:mx-auto lg:grid lg:max-w-7xl lg:grid-cols-2 lg:px-8">
            <div className="lg:col-start-2 lg:pl-8">
              <div className="mx-auto max-w-prose text-base lg:ml-auto lg:mr-0 lg:max-w-lg">
                <h2 className="font-semibold leading-6 text-primary-600">
                  {page.history.subtitle}
                </h2>
                <h3 className="mt-2 text-3xl font-bold leading-8 tracking-tight text-gray-900 sm:text-4xl">
                  {page.history.title}
                </h3>
                <p className="mt-8 text-lg text-gray-500">
                  {page.history.firstParagraph}
                </p>
                <p className="mt-8 text-lg text-gray-500">
                  {page.history.secondParagraph} &quot;
                  <span className="text-primary-500">imSoft</span>&quot;.
                </p>
                <p className="mt-8 text-lg text-gray-500">
                  {page.history.thirdParagraph}
                </p>
                <p className="mt-8 text-lg text-gray-500">
                  {page.history.fourthParagraph1}
                  <span className="text-primary-500"> imSoft</span>
                  {page.history.fourthParagraph2}
                </p>
                <p className="mt-8 text-lg text-gray-500">
                  {page.history.fifthParagraph1}
                  <span className="text-primary-500">imSoft</span>
                  {page.history.fifthParagraph2}
                  <span className="text-primary-500"> imSoft</span>
                  {page.history.fifthParagraph3}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default AboutUsPage;
