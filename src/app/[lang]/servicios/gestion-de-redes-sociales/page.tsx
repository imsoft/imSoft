import {
  IntroductorySection,
  FeaturesSection,
  CallToActionSection,
  PriceSection,
} from "@/components/ui/services";
import {
  PhotoIcon,
  PresentationChartBarIcon,
  UsersIcon,
  EyeIcon,
  PresentationChartLineIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";
import { Metadata } from "next";
import { Locale } from "../../../../../i18n.config";
import type { HeroIcon } from "@/interfaces";
import { getDictionary } from "@/lib/dictionary";

export const generateMetadata = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}): Promise<Metadata> => {
  const { metadata } = await getDictionary(lang);
  return {
    title: metadata.service.main.socialNetworkManagement.title,
    description: metadata.service.main.socialNetworkManagement.description,
    keywords: metadata.service.main.socialNetworkManagement.keywords,
    twitter: {
      title: metadata.service.main.socialNetworkManagement.twitter.title,
      description:
        metadata.service.main.socialNetworkManagement.twitter.description,
    },
    openGraph: {
      title: metadata.service.main.socialNetworkManagement.openGraph.title,
      description:
        metadata.service.main.socialNetworkManagement.openGraph.description,
    },
  };
};

const iconMapping: { [key: string]: HeroIcon } = {
  PhotoIcon,
  PresentationChartBarIcon,
  UsersIcon,
  EyeIcon,
  PresentationChartLineIcon,
  BellAlertIcon,
};

const SocialMediaManagementPage = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}) => {
  const { page } = await getDictionary(lang);

  const serviceFeatures =
    page.services.socialNetworkManagement.featuresSection.serviceFeatures.map(
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
            page.services.socialNetworkManagement.introductorySection.title
          }
          description={
            page.services.socialNetworkManagement.introductorySection
              .description
          }
          callToAction1={
            page.services.socialNetworkManagement.introductorySection
              .callToAction1
          }
          callToAction2={
            page.services.socialNetworkManagement.introductorySection
              .callToAction2
          }
          callToAction3={
            page.services.socialNetworkManagement.introductorySection
              .callToAction3
          }
          lang={lang}
        />

        <FeaturesSection
          topic={page.services.socialNetworkManagement.featuresSection.topic}
          title={page.services.socialNetworkManagement.featuresSection.title}
          description={
            page.services.socialNetworkManagement.featuresSection.description
          }
          serviceFeatures={serviceFeatures}
        />

        <PriceSection
          topic={page.services.socialNetworkManagement.priceSection.topic}
          description={
            page.services.socialNetworkManagement.priceSection.description
          }
          listOfPackages={
            page.services.socialNetworkManagement.priceSection.listOfPackages
          }
          title={page.services.socialNetworkManagement.priceSection.title}
          whatIncludes={
            page.services.socialNetworkManagement.priceSection.whatIncludes
          }
          callToAction1={
            page.services.socialNetworkManagement.priceSection.callToAction1
          }
          callToAction2={
            page.services.socialNetworkManagement.priceSection.callToAction2
          }
          callToAction3={
            page.services.socialNetworkManagement.priceSection.callToAction3
          }
          callToAction4={
            page.services.socialNetworkManagement.priceSection.callToAction4
          }
          lang={lang}
        />

        <CallToActionSection
          imageUrl={
            page.services.socialNetworkManagement.callToActionSection.imageUrl
          }
          topic={
            page.services.socialNetworkManagement.callToActionSection.topic
          }
          title={
            page.services.socialNetworkManagement.callToActionSection.title
          }
          description={
            page.services.socialNetworkManagement.callToActionSection
              .description
          }
          callToAction={
            page.services.socialNetworkManagement.callToActionSection
              .callToAction
          }
          lang={lang}
        />
      </main>
    </>
  );
};

export default SocialMediaManagementPage;
