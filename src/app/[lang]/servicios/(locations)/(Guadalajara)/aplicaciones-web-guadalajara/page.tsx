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
    title: metadata.service.location.guadalajara.webApplications.title,
    description: metadata.service.location.guadalajara.webApplications.description,
    keywords: metadata.service.location.guadalajara.webApplications.keywords,
    twitter: {
      title: metadata.service.location.guadalajara.webApplications.twitter.title,
      description:
        metadata.service.location.guadalajara.webApplications.twitter.description,
    },
    openGraph: {
      title: metadata.service.location.guadalajara.webApplications.openGraph.title,
      description:
        metadata.service.location.guadalajara.webApplications.openGraph.description,
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

const WebAppPageGuadalajara = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}) => {
  const { page } = await getDictionary(lang);

  const serviceFeatures =
    page.services.locations.guadalajara.services.webApplications.featuresSection.serviceFeatures.map(
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
            page.services.locations.guadalajara.services.webApplications
              .introductorySection.title
          }
          description={
            page.services.locations.guadalajara.services.webApplications
              .introductorySection.description
          }
          callToAction1={
            page.services.locations.guadalajara.services.webApplications
              .introductorySection.callToAction1
          }
          callToAction2={
            page.services.locations.guadalajara.services.webApplications
              .introductorySection.callToAction2
          }
          callToAction3={
            page.services.locations.guadalajara.services.webApplications
              .introductorySection.callToAction3
          }
          lang={lang}
        />

        <FeaturesSection
          topic={
            page.services.locations.guadalajara.services.webApplications
              .featuresSection.topic
          }
          title={
            page.services.locations.guadalajara.services.webApplications
              .featuresSection.title
          }
          description={
            page.services.locations.guadalajara.services.webApplications
              .featuresSection.description
          }
          serviceFeatures={serviceFeatures}
        />

        <PriceSection
          topic={
            page.services.locations.guadalajara.services.webApplications
              .priceSection.topic
          }
          description={
            page.services.locations.guadalajara.services.webApplications
              .priceSection.description
          }
          listOfPackages={
            page.services.locations.guadalajara.services.webApplications
              .priceSection.listOfPackages
          }
          title={
            page.services.locations.guadalajara.services.webApplications
              .priceSection.title
          }
          whatIncludes={
            page.services.locations.guadalajara.services.webApplications
              .priceSection.whatIncludes
          }
          callToAction1={
            page.services.locations.guadalajara.services.webApplications
              .priceSection.callToAction1
          }
          callToAction2={
            page.services.locations.guadalajara.services.webApplications
              .priceSection.callToAction2
          }
          callToAction3={
            page.services.locations.guadalajara.services.webApplications
              .priceSection.callToAction3
          }
          callToAction4={
            page.services.locations.guadalajara.services.webApplications
              .priceSection.callToAction4
          }
          lang={lang}
        />

        <CallToActionSection
          imageUrl={
            page.services.locations.guadalajara.services.webApplications
              .callToActionSection.imageUrl
          }
          topic={
            page.services.locations.guadalajara.services.webApplications
              .callToActionSection.topic
          }
          title={
            page.services.locations.guadalajara.services.webApplications
              .callToActionSection.title
          }
          description={
            page.services.locations.guadalajara.services.webApplications
              .callToActionSection.description
          }
          callToAction={
            page.services.locations.guadalajara.services.webApplications
              .callToActionSection.callToAction
          }
          lang={lang}
        />
      </main>
    </>
  );
};

export default WebAppPageGuadalajara;
