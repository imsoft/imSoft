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
  DocumentTextIcon,
  PhotoIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ClipboardDocumentIcon,
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
    title: metadata.service.location.tlaquepaque.campaignsInGoogleAds.title,
    description: metadata.service.location.tlaquepaque.campaignsInGoogleAds.description,
    keywords: metadata.service.location.tlaquepaque.campaignsInGoogleAds.keywords,
    twitter: {
      title: metadata.service.location.tlaquepaque.campaignsInGoogleAds.twitter.title,
      description:
        metadata.service.location.tlaquepaque.campaignsInGoogleAds.twitter.description,
    },
    openGraph: {
      title: metadata.service.location.tlaquepaque.campaignsInGoogleAds.openGraph.title,
      description:
        metadata.service.location.tlaquepaque.campaignsInGoogleAds.openGraph.description,
    },
  };
};

const iconMapping: { [key: string]: HeroIcon } = {
  PaintBrushIcon,
  DocumentTextIcon,
  PhotoIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ClipboardDocumentIcon,
};

const GoogleAdsCampains = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}) => {
  const { page } = await getDictionary(lang);

  const serviceFeatures =
    page.services.locations.tlaquepaque.services.campaignsInGoogleAds.featuresSection.serviceFeatures.map(
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
            page.services.locations.tlaquepaque.services.campaignsInGoogleAds
              .introductorySection.title
          }
          description={
            page.services.locations.tlaquepaque.services.campaignsInGoogleAds
              .introductorySection.description
          }
          callToAction1={
            page.services.locations.tlaquepaque.services.campaignsInGoogleAds
              .introductorySection.callToAction1
          }
          callToAction2={
            page.services.locations.tlaquepaque.services.campaignsInGoogleAds
              .introductorySection.callToAction2
          }
          callToAction3={
            page.services.locations.tlaquepaque.services.campaignsInGoogleAds
              .introductorySection.callToAction3
          }
          lang={lang}
        />

        <FeaturesSection
          topic={
            page.services.locations.tlaquepaque.services.campaignsInGoogleAds
              .featuresSection.topic
          }
          title={
            page.services.locations.tlaquepaque.services.campaignsInGoogleAds
              .featuresSection.title
          }
          description={
            page.services.locations.tlaquepaque.services.campaignsInGoogleAds
              .featuresSection.description
          }
          serviceFeatures={serviceFeatures}
        />

        <PriceSection
          topic={
            page.services.locations.tlaquepaque.services.campaignsInGoogleAds
              .priceSection.topic
          }
          description={
            page.services.locations.tlaquepaque.services.campaignsInGoogleAds
              .priceSection.description
          }
          listOfPackages={
            page.services.locations.tlaquepaque.services.campaignsInGoogleAds
              .priceSection.listOfPackages
          }
          title={
            page.services.locations.tlaquepaque.services.campaignsInGoogleAds
              .priceSection.title
          }
          whatIncludes={
            page.services.locations.tlaquepaque.services.campaignsInGoogleAds
              .priceSection.whatIncludes
          }
          callToAction1={
            page.services.locations.tlaquepaque.services.campaignsInGoogleAds
              .priceSection.callToAction1
          }
          callToAction2={
            page.services.locations.tlaquepaque.services.campaignsInGoogleAds
              .priceSection.callToAction2
          }
          callToAction3={
            page.services.locations.tlaquepaque.services.campaignsInGoogleAds
              .priceSection.callToAction3
          }
          callToAction4={
            page.services.locations.tlaquepaque.services.campaignsInGoogleAds
              .priceSection.callToAction4
          }
          lang={lang}
        />

        <CallToActionSection
          imageUrl={
            page.services.locations.tlaquepaque.services.campaignsInGoogleAds
              .callToActionSection.imageUrl
          }
          topic={
            page.services.locations.tlaquepaque.services.campaignsInGoogleAds
              .callToActionSection.topic
          }
          title={
            page.services.locations.tlaquepaque.services.campaignsInGoogleAds
              .callToActionSection.title
          }
          description={
            page.services.locations.tlaquepaque.services.campaignsInGoogleAds
              .callToActionSection.description
          }
          callToAction={
            page.services.locations.tlaquepaque.services.campaignsInGoogleAds
              .callToActionSection.callToAction
          }
          lang={lang}
        />
      </main>
    </>
  );
};

export default GoogleAdsCampains;
