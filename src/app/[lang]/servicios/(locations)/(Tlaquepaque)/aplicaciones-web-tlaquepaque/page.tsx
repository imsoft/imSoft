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
  ChartBarIcon,
  CogIcon,
  DevicePhoneMobileIcon,
  WrenchIcon,
  ShieldCheckIcon,
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
    title: metadata.service.location.tlaquepaque.webApplications.title,
    description: metadata.service.location.tlaquepaque.webApplications.description,
    keywords: metadata.service.location.tlaquepaque.webApplications.keywords,
    twitter: {
      title: metadata.service.location.tlaquepaque.webApplications.twitter.title,
      description:
        metadata.service.location.tlaquepaque.webApplications.twitter.description,
    },
    openGraph: {
      title: metadata.service.location.tlaquepaque.webApplications.openGraph.title,
      description:
        metadata.service.location.tlaquepaque.webApplications.openGraph.description,
    },
  };
};

const iconMapping: { [key: string]: HeroIcon } = {
  PaintBrushIcon,
  ChartBarIcon,
  CogIcon,
  DevicePhoneMobileIcon,
  WrenchIcon,
  ShieldCheckIcon,
};

const WebAppPageTlaquepaque = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}) => {
  const { page } = await getDictionary(lang);

  const serviceFeatures =
    page.services.locations.tlaquepaque.services.webApplications.featuresSection.serviceFeatures.map(
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
            page.services.locations.tlaquepaque.services.webApplications
              .introductorySection.title
          }
          description={
            page.services.locations.tlaquepaque.services.webApplications
              .introductorySection.description
          }
          callToAction1={
            page.services.locations.tlaquepaque.services.webApplications
              .introductorySection.callToAction1
          }
          callToAction2={
            page.services.locations.tlaquepaque.services.webApplications
              .introductorySection.callToAction2
          }
          callToAction3={
            page.services.locations.tlaquepaque.services.webApplications
              .introductorySection.callToAction3
          }
          lang={lang}
        />

        <FeaturesSection
          topic={
            page.services.locations.tlaquepaque.services.webApplications
              .featuresSection.topic
          }
          title={
            page.services.locations.tlaquepaque.services.webApplications
              .featuresSection.title
          }
          description={
            page.services.locations.tlaquepaque.services.webApplications
              .featuresSection.description
          }
          serviceFeatures={serviceFeatures}
        />

        <PriceSection
          topic={
            page.services.locations.tlaquepaque.services.webApplications
              .priceSection.topic
          }
          description={
            page.services.locations.tlaquepaque.services.webApplications
              .priceSection.description
          }
          listOfPackages={
            page.services.locations.tlaquepaque.services.webApplications
              .priceSection.listOfPackages
          }
          title={
            page.services.locations.tlaquepaque.services.webApplications
              .priceSection.title
          }
          whatIncludes={
            page.services.locations.tlaquepaque.services.webApplications
              .priceSection.whatIncludes
          }
          callToAction1={
            page.services.locations.tlaquepaque.services.webApplications
              .priceSection.callToAction1
          }
          callToAction2={
            page.services.locations.tlaquepaque.services.webApplications
              .priceSection.callToAction2
          }
          callToAction3={
            page.services.locations.tlaquepaque.services.webApplications
              .priceSection.callToAction3
          }
          callToAction4={
            page.services.locations.tlaquepaque.services.webApplications
              .priceSection.callToAction4
          }
          lang={lang}
        />

        <CallToActionSection
          imageUrl={
            page.services.locations.tlaquepaque.services.webApplications
              .callToActionSection.imageUrl
          }
          topic={
            page.services.locations.tlaquepaque.services.webApplications
              .callToActionSection.topic
          }
          title={
            page.services.locations.tlaquepaque.services.webApplications
              .callToActionSection.title
          }
          description={
            page.services.locations.tlaquepaque.services.webApplications
              .callToActionSection.description
          }
          callToAction={
            page.services.locations.tlaquepaque.services.webApplications
              .callToActionSection.callToAction
          }
          lang={lang}
        />
      </main>
    </>
  );
};

export default WebAppPageTlaquepaque;
