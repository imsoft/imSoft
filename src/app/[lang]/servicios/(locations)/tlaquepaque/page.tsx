import { Metadata } from "next";
import Image from "next/image";
import { Locale } from "../../../../../../i18n.config";
import { getDictionary } from "@/lib/dictionary";
import { CustomLink } from "@/components/ui/shared";

export const metadata: Metadata = {
  title: "Servicios de Desarrollo Web en Tlaquepaque | imSoft",
  description:
    "En imSoft ofrecemos servicios de diseño y desarrollo web personalizados en Tlaquepaque. Creamos sitios web responsivos, atractivos y optimizados para SEO, asegurando la mejor presencia online para tu negocio. Contáctanos para transformar tus ideas en una realidad digital exitosa.",
  keywords: [
    "Desarrollo Web Tlaquepaque",
    "Diseño Web en Tlaquepaque",
    "Servicios Web Tlaquepaque",
    "Creación de Sitios Web Tlaquepaque",
    "Ecommerce Tlaquepaque",
    "SEO Tlaquepaque",
    "Consultoría Web Tlaquepaque",
    "Agencia Web Tlaquepaque",
    "Desarrollo de Aplicaciones Tlaquepaque",
  ],
  twitter: {
    title: "Desarrollo y Diseño Web en Tlaquepaque | imSoft",
    description:
      "Transforma tu negocio con nuestros servicios de desarrollo y diseño web en Tlaquepaque. Sitios web personalizados, optimizados para SEO y listos para competir en el mercado digital. ¡Contáctanos y empieza tu proyecto hoy!",
  },
  openGraph: {
    title: "Servicios de Desarrollo Web en Tlaquepaque | imSoft",
    description:
      "Potencia tu negocio en línea con soluciones web a medida en Tlaquepaque. En imSoft, ofrecemos diseño, desarrollo, SEO y más para asegurar el éxito de tu proyecto en internet. Contáctanos para saber más.",
  },
};

const ServicesPage = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}) => {
  const { page } = await getDictionary(lang);
  return (
    <>
      <main>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl py-16 sm:py-24 lg:max-w-none lg:py-12">
            <h2
              id="collections-heading"
              className="text-5xl pb-8 text-center font-bold text-primary-500"
            >
              {page.services.locations.tlaquepaque.title}
            </h2>

            <div className="mt-6 space-y-12 lg:grid lg:grid-cols-3 lg:gap-x-6 lg:space-y-0">
              {page.services.locations.tlaquepaque.ourServices.map(
                (serviceCard) => (
                  <div key={serviceCard.name} className="group relative">
                    <div className="relative h-80 w-full overflow-hidden rounded-lg bg-white group-hover:opacity-75 sm:aspect-w-2 sm:aspect-h-1 sm:h-64 lg:aspect-w-1 lg:aspect-h-1">
                      <Image
                        src={serviceCard.imageUrl}
                        alt={serviceCard.imageAlt}
                        className="h-full w-full object-cover object-center"
                        width={359}
                        height={256}
                      />
                    </div>
                    <h3 className="mt-6 text-base font-semibold text-gray-900">
                      <CustomLink href={serviceCard.href} lang={lang}>
                        <span className="absolute inset-0" />
                        {serviceCard.name}
                      </CustomLink>
                    </h3>
                    <p className="mb-6 text-sm text-gray-500">
                      {serviceCard.description}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ServicesPage;
