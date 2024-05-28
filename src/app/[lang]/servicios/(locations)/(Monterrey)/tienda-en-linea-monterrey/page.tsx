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
  UserGroupIcon,
  ClockIcon,
  PresentationChartBarIcon,
  ArrowUpIcon,
  ArrowTrendingUpIcon,
  ShoppingBagIcon,
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
    title: metadata.service.location.monterrey.ecommerce.title,
    description: metadata.service.location.monterrey.ecommerce.description,
    keywords: metadata.service.location.monterrey.ecommerce.keywords,
    twitter: {
      title: metadata.service.location.monterrey.ecommerce.twitter.title,
      description:
        metadata.service.location.monterrey.ecommerce.twitter.description,
    },
    openGraph: {
      title: metadata.service.location.monterrey.ecommerce.openGraph.title,
      description:
        metadata.service.location.monterrey.ecommerce.openGraph.description,
    },
  };
};

const iconMapping: { [key: string]: HeroIcon } = {
  UserGroupIcon,
  ClockIcon,
  PresentationChartBarIcon,
  ArrowUpIcon,
  ArrowTrendingUpIcon,
  ShoppingBagIcon,
};

const EcommercePage = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}) => {
  const { page } = await getDictionary(lang);

  const serviceFeatures =
    page.services.locations.monterrey.services.ecommerce.featuresSection.serviceFeatures.map(
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
            page.services.locations.monterrey.services.ecommerce
              .introductorySection.title
          }
          description={
            page.services.locations.monterrey.services.ecommerce
              .introductorySection.description
          }
          callToAction1={
            page.services.locations.monterrey.services.ecommerce
              .introductorySection.callToAction1
          }
          callToAction2={
            page.services.locations.monterrey.services.ecommerce
              .introductorySection.callToAction2
          }
          callToAction3={
            page.services.locations.monterrey.services.ecommerce
              .introductorySection.callToAction3
          }
          lang={lang}
        />

        <FeaturesSection
          topic={
            page.services.locations.monterrey.services.ecommerce.featuresSection
              .topic
          }
          title={
            page.services.locations.monterrey.services.ecommerce.featuresSection
              .title
          }
          description={
            page.services.locations.monterrey.services.ecommerce.featuresSection
              .description
          }
          serviceFeatures={serviceFeatures}
        />

        <PriceSection
          topic={
            page.services.locations.monterrey.services.ecommerce.priceSection
              .topic
          }
          description={
            page.services.locations.monterrey.services.ecommerce.priceSection
              .description
          }
          listOfPackages={
            page.services.locations.monterrey.services.ecommerce.priceSection
              .listOfPackages
          }
          title={
            page.services.locations.monterrey.services.ecommerce.priceSection
              .title
          }
          whatIncludes={
            page.services.locations.monterrey.services.ecommerce.priceSection
              .whatIncludes
          }
          callToAction1={
            page.services.locations.monterrey.services.ecommerce.priceSection
              .callToAction1
          }
          callToAction2={
            page.services.locations.monterrey.services.ecommerce.priceSection
              .callToAction2
          }
          callToAction3={
            page.services.locations.monterrey.services.ecommerce.priceSection
              .callToAction3
          }
          callToAction4={
            page.services.locations.monterrey.services.ecommerce.priceSection
              .callToAction4
          }
          lang={lang}
        />

        <CallToActionSection
          imageUrl={
            page.services.locations.monterrey.services.ecommerce
              .callToActionSection.imageUrl
          }
          topic={
            page.services.locations.monterrey.services.ecommerce
              .callToActionSection.topic
          }
          title={
            page.services.locations.monterrey.services.ecommerce
              .callToActionSection.title
          }
          description={
            page.services.locations.monterrey.services.ecommerce
              .callToActionSection.description
          }
          callToAction={
            page.services.locations.monterrey.services.ecommerce
              .callToActionSection.callToAction
          }
          lang={lang}
        />
      </main>
    </>
  );
};

export default EcommercePage;
