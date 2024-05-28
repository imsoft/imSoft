import {
  IntroductorySection,
  FeaturesSection,
  CallToActionSection,
  PriceSection,
} from "@/components/ui/services";
import type { HeroIcon } from "@/interfaces";
import {
  PhotoIcon,
  PresentationChartBarIcon,
  UsersIcon,
  EyeIcon,
  PresentationChartLineIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";
import { Metadata } from "next";
import { Locale } from "../../../../../../../i18n.config";
import { getDictionary } from "@/lib/dictionary";

export const generateMetadata = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}): Promise<Metadata> => {
  const { metadata } = await getDictionary(lang);
  return {
    title: metadata.service.location.monterrey.socialNetworkManagement.title,
    description:
      metadata.service.location.monterrey.socialNetworkManagement.description,
    keywords:
      metadata.service.location.monterrey.socialNetworkManagement.keywords,
    twitter: {
      title:
        metadata.service.location.monterrey.socialNetworkManagement.twitter
          .title,
      description:
        metadata.service.location.monterrey.socialNetworkManagement.twitter
          .description,
    },
    openGraph: {
      title:
        metadata.service.location.monterrey.socialNetworkManagement.openGraph
          .title,
      description:
        metadata.service.location.monterrey.socialNetworkManagement.openGraph
          .description,
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
    page.services.locations.monterrey.services.socialNetworkManagement.featuresSection.serviceFeatures.map(
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
            page.services.locations.monterrey.services.socialNetworkManagement
              .introductorySection.title
          }
          description={
            page.services.locations.monterrey.services.socialNetworkManagement
              .introductorySection.description
          }
          callToAction1={
            page.services.locations.monterrey.services.socialNetworkManagement
              .introductorySection.callToAction1
          }
          callToAction2={
            page.services.locations.monterrey.services.socialNetworkManagement
              .introductorySection.callToAction2
          }
          callToAction3={
            page.services.locations.monterrey.services.socialNetworkManagement
              .introductorySection.callToAction3
          }
          lang={lang}
        />

        <FeaturesSection
          topic={
            page.services.locations.monterrey.services.socialNetworkManagement
              .featuresSection.topic
          }
          title={
            page.services.locations.monterrey.services.socialNetworkManagement
              .featuresSection.title
          }
          description={
            page.services.locations.monterrey.services.socialNetworkManagement
              .featuresSection.description
          }
          serviceFeatures={serviceFeatures}
        />

        <PriceSection
          topic={
            page.services.locations.monterrey.services.socialNetworkManagement
              .priceSection.topic
          }
          description={
            page.services.locations.monterrey.services.socialNetworkManagement
              .priceSection.description
          }
          listOfPackages={
            page.services.locations.monterrey.services.socialNetworkManagement
              .priceSection.listOfPackages
          }
          title={
            page.services.locations.monterrey.services.socialNetworkManagement
              .priceSection.title
          }
          whatIncludes={
            page.services.locations.monterrey.services.socialNetworkManagement
              .priceSection.whatIncludes
          }
          callToAction1={
            page.services.locations.monterrey.services.socialNetworkManagement
              .priceSection.callToAction1
          }
          callToAction2={
            page.services.locations.monterrey.services.socialNetworkManagement
              .priceSection.callToAction2
          }
          callToAction3={
            page.services.locations.monterrey.services.socialNetworkManagement
              .priceSection.callToAction3
          }
          callToAction4={
            page.services.locations.monterrey.services.socialNetworkManagement
              .priceSection.callToAction4
          }
          lang={lang}
        />

        <CallToActionSection
          imageUrl={
            page.services.locations.monterrey.services.socialNetworkManagement
              .callToActionSection.imageUrl
          }
          topic={
            page.services.locations.monterrey.services.socialNetworkManagement
              .callToActionSection.topic
          }
          title={
            page.services.locations.monterrey.services.socialNetworkManagement
              .callToActionSection.title
          }
          description={
            page.services.locations.monterrey.services.socialNetworkManagement
              .callToActionSection.description
          }
          callToAction={
            page.services.locations.monterrey.services.socialNetworkManagement
              .callToActionSection.callToAction
          }
          lang={lang}
        />
      </main>
    </>
  );
};

export default SocialMediaManagementPage;
