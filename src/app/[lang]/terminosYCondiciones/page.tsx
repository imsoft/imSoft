import { Metadata } from "next";
import { Locale } from "../../../../i18n.config";
import { getDictionary } from "@/lib/dictionary";

export const generateMetadata = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}): Promise<Metadata> => {
  const { metadata } = await getDictionary(lang);
  return {
    title: metadata.termsAndConditions.title,
    description: metadata.termsAndConditions.description,
    keywords: metadata.termsAndConditions.keywords,
    twitter: {
      title: metadata.termsAndConditions.twitter.title,
      description: metadata.termsAndConditions.twitter.description,
    },
    openGraph: {
      title: metadata.termsAndConditions.openGraph.title,
      description: metadata.termsAndConditions.openGraph.description,
    },
  };
};

const TermsAndConditionsPage = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}) => {
  const { page } = await getDictionary(lang);
  return (
    <>
      <main>
        <div className="relative overflow-hidden bg-white py-16">
          <div className="relative px-6 lg:px-8">
            <div className="mx-auto max-w-prose text-lg">
              <h1>
                <span className="block text-center text-lg font-semibold text-primary-600">
                  imSoft
                </span>
                <span className="mt-2 block text-center text-3xl font-bold leading-8 tracking-tight text-gray-900 sm:text-4xl">
                  {page.termsAndConditions.title}
                </span>
              </h1>
            </div>
            <div className="prose prose-lg prose-indigo max-w-screen-lg mx-auto mt-6 text-gray-500">
              <ul>
                {page.termsAndConditions.termsList.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default TermsAndConditionsPage;
