import { Metadata } from "next";
import {
  IntroductorySection,
  FeaturesSection,
  CallToActionSection,
  PriceSection,
} from "@/components/ui/services";
import type { HeroIcon } from "@/interfaces";
import {
  ComputerDesktopIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  WrenchScrewdriverIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Locale } from "../../../../../i18n.config";
import { getDictionary } from "@/lib/dictionary";

export const generateMetadata = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}): Promise<Metadata> => {
  const { metadata } = await getDictionary(lang);
  return {
    title: metadata.service.main.website.title,
    description: metadata.service.main.website.description,
    keywords: metadata.service.main.website.keywords,
    twitter: {
      title: metadata.service.main.website.twitter.title,
      description:
        metadata.service.main.website.twitter.description,
    },
    openGraph: {
      title: metadata.service.main.website.openGraph.title,
      description:
        metadata.service.main.website.openGraph.description,
    },
  };
};

const iconMapping: { [key: string]: HeroIcon } = {
  ComputerDesktopIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  WrenchScrewdriverIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
};

const WebPagePage = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}) => {
  const { page } = await getDictionary(lang);

  const serviceFeatures =
    page.services.website.featuresSection.serviceFeatures.map(
      (feature: { title: string; description: string; icon: string }) => ({
        ...feature,
        icon: iconMapping[feature.icon] as HeroIcon,
      })
    );

  return (
    <>
      <main>
        <IntroductorySection
          title={page.services.website.introductorySection.title}
          description={page.services.website.introductorySection.description}
          callToAction1={
            page.services.website.introductorySection.callToAction1
          }
          callToAction2={
            page.services.website.introductorySection.callToAction2
          }
          callToAction3={
            page.services.website.introductorySection.callToAction3
          }
          lang={lang}
        />

        <FeaturesSection
          topic={page.services.website.featuresSection.topic}
          title={page.services.website.featuresSection.title}
          description={page.services.website.featuresSection.description}
          serviceFeatures={serviceFeatures}
        />

        <PriceSection
          topic={page.services.website.priceSection.topic}
          description={page.services.website.priceSection.description}
          listOfPackages={page.services.website.priceSection.listOfPackages}
          title={page.services.website.priceSection.title}
          whatIncludes={page.services.website.priceSection.whatIncludes}
          callToAction1={page.services.website.priceSection.callToAction1}
          callToAction2={page.services.website.priceSection.callToAction2}
          callToAction3={page.services.website.priceSection.callToAction3}
          callToAction4={page.services.website.priceSection.callToAction4}
          lang={lang}
        />

        <CallToActionSection
          imageUrl={page.services.website.callToActionSection.imageUrl}
          topic={page.services.website.callToActionSection.topic}
          title={page.services.website.callToActionSection.title}
          description={page.services.website.callToActionSection.description}
          callToAction={page.services.website.callToActionSection.callToAction}
          lang={lang}
        />
      </main>
    </>
  );
};

export default WebPagePage;
