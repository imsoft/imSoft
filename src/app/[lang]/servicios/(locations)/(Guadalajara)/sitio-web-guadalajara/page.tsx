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
  ComputerDesktopIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  WrenchScrewdriverIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Locale } from "../../../../../../../i18n.config";
import { getDictionary } from "@/lib/dictionary";

export const metadata: Metadata = {
  title: "Desarrollo de Sitio Web en Guadalajara | imSoft",
  description:
    "En imSoft, creamos sitios web atractivos y funcionales para negocios en Guadalajara. Contáctanos para darle a tu negocio una sólida presencia en línea.",
  keywords: [
    "imSoft",
    "Sitio web",
    "Desarrollo web Guadalajara",
    "Diseño web Guadalajara",
  ],
  twitter: {
    title: "Sitio Web en Guadalajara | imSoft",
    description:
      "Lleva tu negocio en Guadalajara al mundo digital con un sitio web atractivo y funcional. En imSoft, estamos listos para ayudarte a alcanzar tus objetivos digitales.",
  },
  openGraph: {
    title: "Desarrollo de Sitio Web en Guadalajara | imSoft",
    description:
      "¿Necesitas un sitio web para tu negocio en Guadalajara? En imSoft, diseñamos y desarrollamos soluciones web que se adaptan a tus necesidades.",
  },
};

const iconMapping: { [key: string]: HeroIcon } = {
  ComputerDesktopIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  WrenchScrewdriverIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
};

const WebPagePage = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}) => {
  const { page } = await getDictionary(lang);

  const serviceFeatures =
    page.services.locations.guadalajara.services.website.featuresSection.serviceFeatures.map(
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
            page.services.locations.guadalajara.services.website
              .introductorySection.title
          }
          description={
            page.services.locations.guadalajara.services.website
              .introductorySection.description
          }
          callToAction1={
            page.services.locations.guadalajara.services.website
              .introductorySection.callToAction1
          }
          callToAction2={
            page.services.locations.guadalajara.services.website
              .introductorySection.callToAction2
          }
          callToAction3={
            page.services.locations.guadalajara.services.website
              .introductorySection.callToAction3
          }
          lang={lang}
        />

        <FeaturesSection
          topic={
            page.services.locations.guadalajara.services.website.featuresSection
              .topic
          }
          title={
            page.services.locations.guadalajara.services.website.featuresSection
              .title
          }
          description={
            page.services.locations.guadalajara.services.website.featuresSection
              .description
          }
          serviceFeatures={serviceFeatures}
        />

        <PriceSection
          topic={
            page.services.locations.guadalajara.services.website.priceSection
              .topic
          }
          description={
            page.services.locations.guadalajara.services.website.priceSection
              .description
          }
          listOfPackages={
            page.services.locations.guadalajara.services.website.priceSection
              .listOfPackages
          }
          title={
            page.services.locations.guadalajara.services.website.priceSection
              .title
          }
          whatIncludes={
            page.services.locations.guadalajara.services.website.priceSection
              .whatIncludes
          }
          callToAction1={
            page.services.locations.guadalajara.services.website.priceSection
              .callToAction1
          }
          callToAction2={
            page.services.locations.guadalajara.services.website.priceSection
              .callToAction2
          }
          callToAction3={
            page.services.locations.guadalajara.services.website.priceSection
              .callToAction3
          }
          callToAction4={
            page.services.locations.guadalajara.services.website.priceSection
              .callToAction4
          }
          lang={lang}
        />

        <CallToActionSection
          imageUrl={
            page.services.locations.guadalajara.services.website
              .callToActionSection.imageUrl
          }
          topic={
            page.services.locations.guadalajara.services.website
              .callToActionSection.topic
          }
          title={
            page.services.locations.guadalajara.services.website
              .callToActionSection.title
          }
          description={
            page.services.locations.guadalajara.services.website
              .callToActionSection.description
          }
          callToAction={
            page.services.locations.guadalajara.services.website
              .callToActionSection.callToAction
          }
          lang={lang}
        />
      </main>
    </>
  );
};

export default WebPagePage;