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

export const metadata: Metadata = {
  title: "Gestión de Campañas en Google Ads en Monterrey | imSoft",
  description:
    "Optimiza tu inversión en Monterrey con campañas personalizadas de Google Ads. Mejoramos tu visibilidad, atraemos tráfico de calidad y aumentamos las conversiones localmente.",
  keywords: [
    "imSoft",
    "Google Ads en Monterrey",
    "Campañas PPC Monterrey",
    "Publicidad en línea Monterrey",
    "SEM Monterrey",
  ],
  twitter: {
    title: "Gestión de Campañas en Google Ads",
    description:
      "Maximiza el ROI de tu publicidad en línea con campañas de Google Ads diseñadas para el éxito. Atrae más clientes y aumenta tus conversiones con imSoft.",
  },
  openGraph: {
    title: "Gestión de Campañas en Google Ads",
    description:
      "Alcanza tus objetivos de marketing con campañas de Google Ads optimizadas para rendimiento. Visibilidad mejorada, tráfico de calidad y más conversiones con imSoft.",
  },
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
    page.services.locations.monterrey.services.campaignsInGoogleAds.featuresSection.serviceFeatures.map(
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
            page.services.locations.monterrey.services.campaignsInGoogleAds
              .introductorySection.title
          }
          description={
            page.services.locations.monterrey.services.campaignsInGoogleAds
              .introductorySection.description
          }
          callToAction1={
            page.services.locations.monterrey.services.campaignsInGoogleAds
              .introductorySection.callToAction1
          }
          callToAction2={
            page.services.locations.monterrey.services.campaignsInGoogleAds
              .introductorySection.callToAction2
          }
          callToAction3={
            page.services.locations.monterrey.services.campaignsInGoogleAds
              .introductorySection.callToAction3
          }
          lang={lang}
        />

        <FeaturesSection
          topic={
            page.services.locations.monterrey.services.campaignsInGoogleAds
              .featuresSection.topic
          }
          title={
            page.services.locations.monterrey.services.campaignsInGoogleAds
              .featuresSection.title
          }
          description={
            page.services.locations.monterrey.services.campaignsInGoogleAds
              .featuresSection.description
          }
          serviceFeatures={serviceFeatures}
        />

        <PriceSection
          topic={
            page.services.locations.monterrey.services.campaignsInGoogleAds
              .priceSection.topic
          }
          description={
            page.services.locations.monterrey.services.campaignsInGoogleAds
              .priceSection.description
          }
          listOfPackages={
            page.services.locations.monterrey.services.campaignsInGoogleAds
              .priceSection.listOfPackages
          }
          title={
            page.services.locations.monterrey.services.campaignsInGoogleAds
              .priceSection.title
          }
          whatIncludes={
            page.services.locations.monterrey.services.campaignsInGoogleAds
              .priceSection.whatIncludes
          }
          callToAction1={
            page.services.locations.monterrey.services.campaignsInGoogleAds
              .priceSection.callToAction1
          }
          callToAction2={
            page.services.locations.monterrey.services.campaignsInGoogleAds
              .priceSection.callToAction2
          }
          callToAction3={
            page.services.locations.monterrey.services.campaignsInGoogleAds
              .priceSection.callToAction3
          }
          callToAction4={
            page.services.locations.monterrey.services.campaignsInGoogleAds
              .priceSection.callToAction4
          }
          lang={lang}
        />

        <CallToActionSection
          imageUrl={
            page.services.locations.monterrey.services.campaignsInGoogleAds
              .callToActionSection.imageUrl
          }
          topic={
            page.services.locations.monterrey.services.campaignsInGoogleAds
              .callToActionSection.topic
          }
          title={
            page.services.locations.monterrey.services.campaignsInGoogleAds
              .callToActionSection.title
          }
          description={
            page.services.locations.monterrey.services.campaignsInGoogleAds
              .callToActionSection.description
          }
          callToAction={
            page.services.locations.monterrey.services.campaignsInGoogleAds
              .callToActionSection.callToAction
          }
          lang={lang}
        />
      </main>
    </>
  );
};

export default GoogleAdsCampains;
