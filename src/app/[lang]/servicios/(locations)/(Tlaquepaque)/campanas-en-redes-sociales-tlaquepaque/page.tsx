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
  PaintBrushIcon,
  CubeTransparentIcon,
  PresentationChartLineIcon,
  EyeIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
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
    title: metadata.service.location.tlaquepaque.campaignsOnSocialNetworks.title,
    description: metadata.service.location.tlaquepaque.campaignsOnSocialNetworks.description,
    keywords: metadata.service.location.tlaquepaque.campaignsOnSocialNetworks.keywords,
    twitter: {
      title: metadata.service.location.tlaquepaque.campaignsOnSocialNetworks.twitter.title,
      description:
        metadata.service.location.tlaquepaque.campaignsOnSocialNetworks.twitter.description,
    },
    openGraph: {
      title: metadata.service.location.tlaquepaque.campaignsOnSocialNetworks.openGraph.title,
      description:
        metadata.service.location.tlaquepaque.campaignsOnSocialNetworks.openGraph.description,
    },
  };
};

const iconMapping: { [key: string]: HeroIcon } = {
  PaintBrushIcon,
  CubeTransparentIcon,
  PresentationChartLineIcon,
  EyeIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
};

const SocialMediaCampainsPage = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}) => {
  const { page } = await getDictionary(lang);

  const serviceFeatures =
    page.services.locations.tlaquepaque.services.campaignsOnSocialNetworks.featuresSection.serviceFeatures.map(
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
            page.services.locations.tlaquepaque.services
              .campaignsOnSocialNetworks.introductorySection.title
          }
          description={
            page.services.locations.tlaquepaque.services
              .campaignsOnSocialNetworks.introductorySection.description
          }
          callToAction1={
            page.services.locations.tlaquepaque.services
              .campaignsOnSocialNetworks.introductorySection.callToAction1
          }
          callToAction2={
            page.services.locations.tlaquepaque.services
              .campaignsOnSocialNetworks.introductorySection.callToAction2
          }
          callToAction3={
            page.services.locations.tlaquepaque.services
              .campaignsOnSocialNetworks.introductorySection.callToAction3
          }
          lang={lang}
        />

        <FeaturesSection
          topic={
            page.services.locations.tlaquepaque.services
              .campaignsOnSocialNetworks.featuresSection.topic
          }
          title={
            page.services.locations.tlaquepaque.services
              .campaignsOnSocialNetworks.featuresSection.title
          }
          description={
            page.services.locations.tlaquepaque.services
              .campaignsOnSocialNetworks.featuresSection.description
          }
          serviceFeatures={serviceFeatures}
        />

        <PriceSection
          topic={
            page.services.locations.tlaquepaque.services
              .campaignsOnSocialNetworks.priceSection.topic
          }
          description={
            page.services.locations.tlaquepaque.services
              .campaignsOnSocialNetworks.priceSection.description
          }
          listOfPackages={
            page.services.locations.tlaquepaque.services
              .campaignsOnSocialNetworks.priceSection.listOfPackages
          }
          title={
            page.services.locations.tlaquepaque.services
              .campaignsOnSocialNetworks.priceSection.title
          }
          whatIncludes={
            page.services.locations.tlaquepaque.services
              .campaignsOnSocialNetworks.priceSection.whatIncludes
          }
          callToAction1={
            page.services.locations.tlaquepaque.services
              .campaignsOnSocialNetworks.priceSection.callToAction1
          }
          callToAction2={
            page.services.locations.tlaquepaque.services
              .campaignsOnSocialNetworks.priceSection.callToAction2
          }
          callToAction3={
            page.services.locations.tlaquepaque.services
              .campaignsOnSocialNetworks.priceSection.callToAction3
          }
          callToAction4={
            page.services.locations.tlaquepaque.services
              .campaignsOnSocialNetworks.priceSection.callToAction4
          }
          lang={lang}
        />

        <CallToActionSection
          imageUrl={
            page.services.locations.tlaquepaque.services
              .campaignsOnSocialNetworks.callToActionSection.imageUrl
          }
          topic={
            page.services.locations.tlaquepaque.services
              .campaignsOnSocialNetworks.callToActionSection.topic
          }
          title={
            page.services.locations.tlaquepaque.services
              .campaignsOnSocialNetworks.callToActionSection.title
          }
          description={
            page.services.locations.tlaquepaque.services
              .campaignsOnSocialNetworks.callToActionSection.description
          }
          callToAction={
            page.services.locations.tlaquepaque.services
              .campaignsOnSocialNetworks.callToActionSection.callToAction
          }
          lang={lang}
        />
      </main>
    </>
  );
};

export default SocialMediaCampainsPage;
