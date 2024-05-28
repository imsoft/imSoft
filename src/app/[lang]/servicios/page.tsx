import { Metadata } from "next";
import Image from "next/image";
import { Locale } from "../../../../i18n.config";
import { getDictionary } from "@/lib/dictionary";
import { CustomLink } from "@/components/ui/shared";

export const generateMetadata = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}): Promise<Metadata> => {
  const { metadata } = await getDictionary(lang);
  return {
    title: metadata.service.title,
    description: metadata.service.description,
    keywords: metadata.service.keywords,
    twitter: {
      title: metadata.service.twitter.title,
      description: metadata.service.twitter.description,
    },
    openGraph: {
      title: metadata.service.openGraph.title,
      description: metadata.service.openGraph.description,
    },
  };
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
              {page.services.title}
            </h2>

            <div className="mt-6 space-y-12 lg:grid lg:grid-cols-3 lg:gap-x-6 lg:space-y-0">
              {page.services.ourServices.map((serviceCard) => (
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
                    <CustomLink href={`/${lang}/${serviceCard.href}`} lang={lang}>
                      <span className="absolute inset-0" />
                      {serviceCard.name}
                    </CustomLink>
                  </h3>
                  <p className="mb-6 text-sm text-gray-500">
                    {serviceCard.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ServicesPage;
