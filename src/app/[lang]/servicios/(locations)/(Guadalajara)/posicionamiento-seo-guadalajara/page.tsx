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
  BuildingStorefrontIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  PencilSquareIcon,
  TagIcon,
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
    title: metadata.service.location.guadalajara.positioningSeo.title,
    description: metadata.service.location.guadalajara.positioningSeo.description,
    keywords: metadata.service.location.guadalajara.positioningSeo.keywords,
    twitter: {
      title: metadata.service.location.guadalajara.positioningSeo.twitter.title,
      description:
        metadata.service.location.guadalajara.positioningSeo.twitter.description,
    },
    openGraph: {
      title: metadata.service.location.guadalajara.positioningSeo.openGraph.title,
      description:
        metadata.service.location.guadalajara.positioningSeo.openGraph.description,
    },
  };
};

const iconMapping: { [key: string]: HeroIcon } = {
  EyeIcon,
  BuildingStorefrontIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  PencilSquareIcon,
  TagIcon,
};

const SEOPage = async ({ params: { lang } }: { params: { lang: Locale } }) => {
  const { page } = await getDictionary(lang);

  const serviceFeatures =
    page.services.locations.guadalajara.services.positioningSeo.featuresSection.serviceFeatures.map(
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
            page.services.locations.guadalajara.services.positioningSeo
              .introductorySection.title
          }
          description={
            page.services.locations.guadalajara.services.positioningSeo
              .introductorySection.description
          }
          callToAction1={
            page.services.locations.guadalajara.services.positioningSeo
              .introductorySection.callToAction1
          }
          callToAction2={
            page.services.locations.guadalajara.services.positioningSeo
              .introductorySection.callToAction2
          }
          callToAction3={
            page.services.locations.guadalajara.services.positioningSeo
              .introductorySection.callToAction3
          }
          lang={lang}
        />

        <FeaturesSection
          topic={
            page.services.locations.guadalajara.services.positioningSeo
              .featuresSection.topic
          }
          title={
            page.services.locations.guadalajara.services.positioningSeo
              .featuresSection.title
          }
          description={
            page.services.locations.guadalajara.services.positioningSeo
              .featuresSection.description
          }
          serviceFeatures={serviceFeatures}
        />

        <PriceSection
          topic={
            page.services.locations.guadalajara.services.positioningSeo
              .priceSection.topic
          }
          description={
            page.services.locations.guadalajara.services.positioningSeo
              .priceSection.description
          }
          listOfPackages={
            page.services.locations.guadalajara.services.positioningSeo
              .priceSection.listOfPackages
          }
          title={
            page.services.locations.guadalajara.services.positioningSeo
              .priceSection.title
          }
          whatIncludes={
            page.services.locations.guadalajara.services.positioningSeo
              .priceSection.whatIncludes
          }
          callToAction1={
            page.services.locations.guadalajara.services.positioningSeo
              .priceSection.callToAction1
          }
          callToAction2={
            page.services.locations.guadalajara.services.positioningSeo
              .priceSection.callToAction2
          }
          callToAction3={
            page.services.locations.guadalajara.services.positioningSeo
              .priceSection.callToAction3
          }
          callToAction4={
            page.services.locations.guadalajara.services.positioningSeo
              .priceSection.callToAction4
          }
          lang={lang}
        />

        <CallToActionSection
          imageUrl={
            page.services.locations.guadalajara.services.positioningSeo
              .callToActionSection.imageUrl
          }
          topic={
            page.services.locations.guadalajara.services.positioningSeo
              .callToActionSection.topic
          }
          title={
            page.services.locations.guadalajara.services.positioningSeo
              .callToActionSection.title
          }
          description={
            page.services.locations.guadalajara.services.positioningSeo
              .callToActionSection.description
          }
          callToAction={
            page.services.locations.guadalajara.services.positioningSeo
              .callToActionSection.callToAction
          }
          lang={lang}
        />
      </main>
    </>
  );
};

export default SEOPage;
