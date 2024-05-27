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
import { Locale } from "../../../../../i18n.config";
import { getDictionary } from "@/lib/dictionary";

export const metadata: Metadata = {
  title: "Gestión de Campañas en Google Ads",
  description:
    "Optimiza tu inversión publicitaria con nuestras campañas personalizadas en Google Ads. Nos especializamos en crear y gestionar campañas efectivas que mejoran la visibilidad, atraen tráfico de calidad y aumentan las conversiones, asegurando que obtengas el máximo retorno de tu inversión. Nuestra estrategia se basa en un profundo análisis de datos y en la optimización continua para alcanzar y superar tus objetivos de marketing.",
  keywords: [
    "imSoft",
    "Google Ads",
    "Campañas PPC",
    "Publicidad en línea",
    "SEM",
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
    page.services.campaignsInGoogleAds.featuresSection.serviceFeatures.map(
      (feature: { title: string; description: string; icon: string }) => ({
        ...feature,
        icon: iconMapping[feature.icon] as HeroIcon,
      })
    );

  return (
    <>
      <main>
        <IntroductorySection
          title={page.services.campaignsInGoogleAds.introductorySection.title}
          description={
            page.services.campaignsInGoogleAds.introductorySection.description
          }
          callToAction1={
            page.services.campaignsInGoogleAds.introductorySection.callToAction1
          }
          callToAction2={
            page.services.campaignsInGoogleAds.introductorySection.callToAction2
          }
          callToAction3={
            page.services.campaignsInGoogleAds.introductorySection.callToAction3
          }
          lang={lang}
        />

        <FeaturesSection
          topic={page.services.campaignsInGoogleAds.featuresSection.topic}
          title={page.services.campaignsInGoogleAds.featuresSection.title}
          description={
            page.services.campaignsInGoogleAds.featuresSection.description
          }
          serviceFeatures={serviceFeatures}
        />

        <PriceSection
          topic={page.services.campaignsInGoogleAds.priceSection.title}
          description={
            page.services.campaignsInGoogleAds.priceSection.description
          }
          listOfPackages={
            page.services.campaignsInGoogleAds.priceSection.listOfPackages
          }
          title={page.services.campaignsInGoogleAds.priceSection.title}
          whatIncludes={
            page.services.campaignsInGoogleAds.priceSection.whatIncludes
          }
          callToAction1={
            page.services.campaignsInGoogleAds.priceSection.callToAction1
          }
          callToAction2={
            page.services.campaignsInGoogleAds.priceSection.callToAction2
          }
          callToAction3={
            page.services.campaignsInGoogleAds.priceSection.callToAction3
          }
          callToAction4={
            page.services.campaignsInGoogleAds.priceSection.callToAction4
          }
          lang={lang}
        />

        <CallToActionSection
          imageUrl={
            page.services.campaignsInGoogleAds.callToActionSection.imageUrl
          }
          topic={page.services.campaignsInGoogleAds.callToActionSection.topic}
          title={page.services.campaignsInGoogleAds.callToActionSection.title}
          description={
            page.services.campaignsInGoogleAds.callToActionSection.description
          }
          callToAction={
            page.services.campaignsInGoogleAds.callToActionSection.callToAction
          }
          lang={lang}
        />
      </main>
    </>
  );
};

export default GoogleAdsCampains;
