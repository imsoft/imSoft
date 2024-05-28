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
  EyeIcon,
  PresentationChartBarIcon,
  CircleStackIcon,
  ClipboardDocumentCheckIcon,
  TableCellsIcon,
  ShieldExclamationIcon,
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
    title: metadata.service.location.guadalajara.dataAnalytics.title,
    description: metadata.service.location.guadalajara.dataAnalytics.description,
    keywords: metadata.service.location.guadalajara.dataAnalytics.keywords,
    twitter: {
      title: metadata.service.location.guadalajara.dataAnalytics.twitter.title,
      description:
        metadata.service.location.guadalajara.dataAnalytics.twitter.description,
    },
    openGraph: {
      title: metadata.service.location.guadalajara.dataAnalytics.openGraph.title,
      description:
        metadata.service.location.guadalajara.dataAnalytics.openGraph.description,
    },
  };
};

const iconMapping: { [key: string]: HeroIcon } = {
  EyeIcon,
  PresentationChartBarIcon,
  CircleStackIcon,
  ClipboardDocumentCheckIcon,
  TableCellsIcon,
  ShieldExclamationIcon,
};

const DataAnalitycsPage = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}) => {
  const { page } = await getDictionary(lang);

  const serviceFeatures =
    page.services.locations.guadalajara.services.dataAnalytics.featuresSection.serviceFeatures.map(
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
            page.services.locations.guadalajara.services.dataAnalytics
              .introductorySection.title
          }
          description={
            page.services.locations.guadalajara.services.dataAnalytics
              .introductorySection.description
          }
          callToAction1={
            page.services.locations.guadalajara.services.dataAnalytics
              .introductorySection.callToAction1
          }
          callToAction2={
            page.services.locations.guadalajara.services.dataAnalytics
              .introductorySection.callToAction2
          }
          callToAction3={
            page.services.locations.guadalajara.services.dataAnalytics
              .introductorySection.callToAction3
          }
          lang={lang}
        />

        <FeaturesSection
          topic={
            page.services.locations.guadalajara.services.dataAnalytics
              .featuresSection.topic
          }
          title={
            page.services.locations.guadalajara.services.dataAnalytics
              .featuresSection.title
          }
          description={
            page.services.locations.guadalajara.services.dataAnalytics
              .featuresSection.description
          }
          serviceFeatures={serviceFeatures}
        />

        <PriceSection
          topic={
            page.services.locations.guadalajara.services.dataAnalytics
              .priceSection.topic
          }
          description={
            page.services.locations.guadalajara.services.dataAnalytics
              .priceSection.description
          }
          listOfPackages={
            page.services.locations.guadalajara.services.dataAnalytics
              .priceSection.listOfPackages
          }
          title={
            page.services.locations.guadalajara.services.dataAnalytics
              .priceSection.title
          }
          whatIncludes={
            page.services.locations.guadalajara.services.dataAnalytics
              .priceSection.whatIncludes
          }
          callToAction1={
            page.services.locations.guadalajara.services.dataAnalytics
              .priceSection.callToAction1
          }
          callToAction2={
            page.services.locations.guadalajara.services.dataAnalytics
              .priceSection.callToAction2
          }
          callToAction3={
            page.services.locations.guadalajara.services.dataAnalytics
              .priceSection.callToAction3
          }
          callToAction4={
            page.services.locations.guadalajara.services.dataAnalytics
              .priceSection.callToAction4
          }
          lang={lang}
        />

        <CallToActionSection
          imageUrl={
            page.services.locations.guadalajara.services.dataAnalytics
              .callToActionSection.imageUrl
          }
          topic={
            page.services.locations.guadalajara.services.dataAnalytics
              .callToActionSection.topic
          }
          title={
            page.services.locations.guadalajara.services.dataAnalytics
              .callToActionSection.title
          }
          description={
            page.services.locations.guadalajara.services.dataAnalytics
              .callToActionSection.description
          }
          callToAction={
            page.services.locations.guadalajara.services.dataAnalytics
              .callToActionSection.callToAction
          }
          lang={lang}
        />
      </main>
    </>
  );
};

export default DataAnalitycsPage;
