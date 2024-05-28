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
  ChevronDoubleDownIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
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
    title: metadata.service.location.tlaquepaque.mobileApps.title,
    description: metadata.service.location.tlaquepaque.mobileApps.description,
    keywords: metadata.service.location.tlaquepaque.mobileApps.keywords,
    twitter: {
      title: metadata.service.location.tlaquepaque.mobileApps.twitter.title,
      description:
        metadata.service.location.tlaquepaque.mobileApps.twitter.description,
    },
    openGraph: {
      title: metadata.service.location.tlaquepaque.mobileApps.openGraph.title,
      description:
        metadata.service.location.tlaquepaque.mobileApps.openGraph.description,
    },
  };
};
const iconMapping: { [key: string]: HeroIcon } = {
  ChevronDoubleDownIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
};

const MobileAppsPage = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}) => {
  const { page } = await getDictionary(lang);

  const serviceFeatures =
    page.services.locations.tlaquepaque.services.mobileApps.featuresSection.serviceFeatures.map(
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
            page.services.locations.tlaquepaque.services.mobileApps
              .introductorySection.title
          }
          description={
            page.services.locations.tlaquepaque.services.mobileApps
              .introductorySection.description
          }
          callToAction1={
            page.services.locations.tlaquepaque.services.mobileApps
              .introductorySection.callToAction1
          }
          callToAction2={
            page.services.locations.tlaquepaque.services.mobileApps
              .introductorySection.callToAction2
          }
          callToAction3={
            page.services.locations.tlaquepaque.services.mobileApps
              .introductorySection.callToAction3
          }
          lang={lang}
        />

        <FeaturesSection
          topic={
            page.services.locations.tlaquepaque.services.mobileApps
              .featuresSection.topic
          }
          title={
            page.services.locations.tlaquepaque.services.mobileApps
              .featuresSection.title
          }
          description={
            page.services.locations.tlaquepaque.services.mobileApps
              .featuresSection.description
          }
          serviceFeatures={serviceFeatures}
        />

        <PriceSection
          topic={
            page.services.locations.tlaquepaque.services.mobileApps.priceSection
              .topic
          }
          description={
            page.services.locations.tlaquepaque.services.mobileApps.priceSection
              .description
          }
          listOfPackages={
            page.services.locations.tlaquepaque.services.mobileApps.priceSection
              .listOfPackages
          }
          title={
            page.services.locations.tlaquepaque.services.mobileApps.priceSection
              .title
          }
          whatIncludes={
            page.services.locations.tlaquepaque.services.mobileApps.priceSection
              .whatIncludes
          }
          callToAction1={
            page.services.locations.tlaquepaque.services.mobileApps.priceSection
              .callToAction1
          }
          callToAction2={
            page.services.locations.tlaquepaque.services.mobileApps.priceSection
              .callToAction2
          }
          callToAction3={
            page.services.locations.tlaquepaque.services.mobileApps.priceSection
              .callToAction3
          }
          callToAction4={
            page.services.locations.tlaquepaque.services.mobileApps.priceSection
              .callToAction4
          }
          lang={lang}
        />

        <CallToActionSection
          imageUrl={
            page.services.locations.tlaquepaque.services.mobileApps
              .callToActionSection.imageUrl
          }
          topic={
            page.services.locations.tlaquepaque.services.mobileApps
              .callToActionSection.topic
          }
          title={
            page.services.locations.tlaquepaque.services.mobileApps
              .callToActionSection.title
          }
          description={
            page.services.locations.tlaquepaque.services.mobileApps
              .callToActionSection.description
          }
          callToAction={
            page.services.locations.tlaquepaque.services.mobileApps
              .callToActionSection.callToAction
          }
          lang={lang}
        />
      </main>
    </>
  );
};

export default MobileAppsPage;
