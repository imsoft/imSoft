import { Metadata } from "next";
import {
  IntroductorySection,
  FeaturesSection,
  CallToActionSection,
  PriceSection,
} from "@/components/ui/services";
import type { HeroIcon } from "@/interfaces";
import {
  EyeIcon,
  DocumentTextIcon,
  DocumentChartBarIcon,
  PresentationChartLineIcon,
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
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
    title: metadata.service.location.zapopan.webConsulting.title,
    description: metadata.service.location.zapopan.webConsulting.description,
    keywords: metadata.service.location.zapopan.webConsulting.keywords,
    twitter: {
      title: metadata.service.location.zapopan.webConsulting.twitter.title,
      description:
        metadata.service.location.zapopan.webConsulting.twitter.description,
    },
    openGraph: {
      title: metadata.service.location.zapopan.webConsulting.openGraph.title,
      description:
        metadata.service.location.zapopan.webConsulting.openGraph.description,
    },
  };
};

const iconMapping: { [key: string]: HeroIcon } = {
  EyeIcon,
  DocumentTextIcon,
  DocumentChartBarIcon,
  PresentationChartLineIcon,
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
};

const ConsultancyPage = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}) => {
  const { page } = await getDictionary(lang);

  const serviceFeatures =
    page.services.locations.zapopan.services.webConsulting.featuresSection.serviceFeatures.map(
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
            page.services.locations.zapopan.services.webConsulting
              .introductorySection.title
          }
          description={
            page.services.locations.zapopan.services.webConsulting
              .introductorySection.description
          }
          callToAction1={
            page.services.locations.zapopan.services.webConsulting
              .introductorySection.callToAction1
          }
          callToAction2={
            page.services.locations.zapopan.services.webConsulting
              .introductorySection.callToAction2
          }
          callToAction3={
            page.services.locations.zapopan.services.webConsulting
              .introductorySection.callToAction3
          }
          lang={lang}
        />

        <FeaturesSection
          topic={
            page.services.locations.zapopan.services.webConsulting
              .featuresSection.topic
          }
          title={
            page.services.locations.zapopan.services.webConsulting
              .featuresSection.title
          }
          description={
            page.services.locations.zapopan.services.webConsulting
              .featuresSection.description
          }
          serviceFeatures={serviceFeatures}
        />

        <PriceSection
          topic={
            page.services.locations.zapopan.services.webConsulting.priceSection
              .topic
          }
          description={
            page.services.locations.zapopan.services.webConsulting.priceSection
              .description
          }
          listOfPackages={
            page.services.locations.zapopan.services.webConsulting.priceSection
              .listOfPackages
          }
          title={
            page.services.locations.zapopan.services.webConsulting.priceSection
              .title
          }
          whatIncludes={
            page.services.locations.zapopan.services.webConsulting.priceSection
              .whatIncludes
          }
          callToAction1={
            page.services.locations.zapopan.services.webConsulting.priceSection
              .callToAction1
          }
          callToAction2={
            page.services.locations.zapopan.services.webConsulting.priceSection
              .callToAction2
          }
          callToAction3={
            page.services.locations.zapopan.services.webConsulting.priceSection
              .callToAction3
          }
          callToAction4={
            page.services.locations.zapopan.services.webConsulting.priceSection
              .callToAction4
          }
          lang={lang}
        />

        <CallToActionSection
          imageUrl={
            page.services.locations.zapopan.services.webConsulting
              .callToActionSection.imageUrl
          }
          topic={
            page.services.locations.zapopan.services.webConsulting
              .callToActionSection.topic
          }
          title={
            page.services.locations.zapopan.services.webConsulting
              .callToActionSection.title
          }
          description={
            page.services.locations.zapopan.services.webConsulting
              .callToActionSection.description
          }
          callToAction={
            page.services.locations.zapopan.services.webConsulting
              .callToActionSection.callToAction
          }
          lang={lang}
        />
      </main>
    </>
  );
};

export default ConsultancyPage;
