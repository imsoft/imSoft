import { Metadata } from "next";
import {
  IntroductorySection,
  FeaturesSection,
  CallToActionSection,
  PriceSection,
} from "@/components/ui/services";
import type {
  HeroIcon,
} from "@/interfaces";
import {
  ComputerDesktopIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  WrenchScrewdriverIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Locale } from "../../../../../../../i18n.config";
import { getDictionary } from "@/lib/dictionary";

export const generateMetadata = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}): Promise<Metadata> => {
  const { metadata } = await getDictionary(lang);
  return {
    title: metadata.service.location.monterrey.website.title,
    description: metadata.service.location.monterrey.website.description,
    keywords: metadata.service.location.monterrey.website.keywords,
    twitter: {
      title: metadata.service.location.monterrey.website.twitter.title,
      description:
        metadata.service.location.monterrey.website.twitter.description,
    },
    openGraph: {
      title: metadata.service.location.monterrey.website.openGraph.title,
      description:
        metadata.service.location.monterrey.website.openGraph.description,
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
    page.services.locations.monterrey.services.website.featuresSection.serviceFeatures.map(
      (feature: { title: string; description: string; icon: string }) => ({
        ...feature,
        icon: iconMapping[feature.icon] as HeroIcon,
      })
    );
  return (
    <>
      <main>
        <IntroductorySection
          title={
            page.services.locations.monterrey.services.website
              .introductorySection.title
          }
          description={
            page.services.locations.monterrey.services.website
              .introductorySection.description
          }
          callToAction1={
            page.services.locations.monterrey.services.website
              .introductorySection.callToAction1
          }
          callToAction2={
            page.services.locations.monterrey.services.website
              .introductorySection.callToAction2
          }
          callToAction3={
            page.services.locations.monterrey.services.website
              .introductorySection.callToAction3
          }
          lang={lang}
        />

        <FeaturesSection
          topic={
            page.services.locations.monterrey.services.website.featuresSection
              .topic
          }
          title={
            page.services.locations.monterrey.services.website.featuresSection
              .title
          }
          description={
            page.services.locations.monterrey.services.website.featuresSection
              .description
          }
          serviceFeatures={serviceFeatures}
        />

        <PriceSection
          topic={
            page.services.locations.monterrey.services.website.priceSection
              .topic
          }
          description={
            page.services.locations.monterrey.services.website.priceSection
              .description
          }
          listOfPackages={
            page.services.locations.monterrey.services.website.priceSection
              .listOfPackages
          }
          title={
            page.services.locations.monterrey.services.website.priceSection
              .title
          }
          whatIncludes={
            page.services.locations.monterrey.services.website.priceSection
              .whatIncludes
          }
          callToAction1={
            page.services.locations.monterrey.services.website.priceSection
              .callToAction1
          }
          callToAction2={
            page.services.locations.monterrey.services.website.priceSection
              .callToAction2
          }
          callToAction3={
            page.services.locations.monterrey.services.website.priceSection
              .callToAction3
          }
          callToAction4={
            page.services.locations.monterrey.services.website.priceSection
              .callToAction4
          }
          lang={lang}
        />

        <CallToActionSection
          imageUrl={
            page.services.locations.monterrey.services.website
              .callToActionSection.imageUrl
          }
          topic={
            page.services.locations.monterrey.services.website
              .callToActionSection.topic
          }
          title={
            page.services.locations.monterrey.services.website
              .callToActionSection.title
          }
          description={
            page.services.locations.monterrey.services.website
              .callToActionSection.description
          }
          callToAction={
            page.services.locations.monterrey.services.website
              .callToActionSection.callToAction
          }
          lang={lang}
        />
      </main>
    </>
  );
};

export default WebPagePage;
