import { Metadata } from "next";
import {
  IntroductorySection,
  FeaturesSection,
  CallToActionSection,
  PriceSection,
} from "@/components/ui/services";
import {
  EyeIcon,
  PresentationChartBarIcon,
  CircleStackIcon,
  ClipboardDocumentCheckIcon,
  TableCellsIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
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
    title: metadata.service.main.dataAnalytics.title,
    description: metadata.service.main.dataAnalytics.description,
    keywords: metadata.service.main.dataAnalytics.keywords,
    twitter: {
      title: metadata.service.main.dataAnalytics.twitter.title,
      description:
        metadata.service.main.dataAnalytics.twitter.description,
    },
    openGraph: {
      title: metadata.service.main.dataAnalytics.openGraph.title,
      description:
        metadata.service.main.dataAnalytics.openGraph.description,
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
    page.services.dataAnalytics.featuresSection.serviceFeatures.map(
      (feature: { title: string; description: string; icon: string }) => ({
        ...feature,
        icon: iconMapping[feature.icon] as HeroIcon,
      })
    );

  return (
    <>
      <main>
        <IntroductorySection
          title={page.services.dataAnalytics.introductorySection.title}
          description={
            page.services.dataAnalytics.introductorySection.description
          }
          callToAction1={
            page.services.dataAnalytics.introductorySection.callToAction1
          }
          callToAction2={
            page.services.dataAnalytics.introductorySection.callToAction2
          }
          callToAction3={
            page.services.dataAnalytics.introductorySection.callToAction3
          }
          lang={lang}
        />

        <FeaturesSection
          topic={page.services.dataAnalytics.featuresSection.topic}
          title={page.services.dataAnalytics.featuresSection.title}
          description={page.services.dataAnalytics.featuresSection.description}
          serviceFeatures={serviceFeatures}
        />

        <PriceSection
          topic={page.services.dataAnalytics.priceSection.topic}
          title={page.services.dataAnalytics.priceSection.title}
          description={page.services.dataAnalytics.priceSection.description}
          whatIncludes={page.services.dataAnalytics.priceSection.whatIncludes}
          listOfPackages={
            page.services.dataAnalytics.priceSection.listOfPackages
          }
          callToAction1={page.services.dataAnalytics.priceSection.callToAction1}
          callToAction2={page.services.dataAnalytics.priceSection.callToAction2}
          callToAction3={page.services.dataAnalytics.priceSection.callToAction3}
          callToAction4={page.services.dataAnalytics.priceSection.callToAction4}
          lang={lang}
        />

        <CallToActionSection
          imageUrl={page.services.dataAnalytics.callToActionSection.imageUrl}
          topic={page.services.dataAnalytics.callToActionSection.topic}
          title={page.services.dataAnalytics.callToActionSection.title}
          description={
            page.services.dataAnalytics.callToActionSection.description
          }
          callToAction={
            page.services.dataAnalytics.callToActionSection.callToAction
          }
          lang={lang}
        />
      </main>
    </>
  );
};

export default DataAnalitycsPage;
