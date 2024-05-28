import { Metadata } from "next";
import { PortfolioCard } from "@/components/ui/portfolio";
import { Locale } from "../../../../i18n.config";
import { getDictionary } from "@/lib/dictionary";

export const generateMetadata = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}): Promise<Metadata> => {
  const { metadata } = await getDictionary(lang);
  return {
    title: metadata.portfolio.title,
    description: metadata.portfolio.description,
    keywords: metadata.portfolio.keywords,
    twitter: {
      title: metadata.portfolio.twitter.title,
      description: metadata.portfolio.twitter.description,
    },
    openGraph: {
      title: metadata.portfolio.openGraph.title,
      description: metadata.portfolio.openGraph.description,
    },
  };
};

const PortfolioPage = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}) => {
  const { page } = await getDictionary(lang);
  return (
    <>
      <main>
        <div className="bg-white">
          <div className="mx-auto max-w-7xl py-12 px-6 lg:px-8 lg:py-24">
            <div className="space-y-12">
              <div className="space-y-5 sm:space-y-4 md:max-w-xl lg:max-w-3xl xl:max-w-none">
                <h2 className="text-3xl font-bold tracking-tight text-primary-500 sm:text-4xl">
                  {page.portfolio.title}
                </h2>
                <p className="text-xl text-gray-500">
                  {page.portfolio.description}
                </p>
              </div>
              <ul
                role="list"
                className="space-y-12 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 sm:space-y-0 lg:grid-cols-3 lg:gap-x-8"
              >
                {page.portfolio.portfolioInfo.map((portfolio) => (
                  <PortfolioCard
                    key={portfolio.alt}
                    name={portfolio.name}
                    type={portfolio.type}
                    href={portfolio.href}
                    alt={portfolio.alt}
                    imageUrl={portfolio.imageUrl}
                    lang={lang}
                  />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default PortfolioPage;
