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
  PresentationChartBarIcon,
  CircleStackIcon,
  ClipboardDocumentCheckIcon,
  TableCellsIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import { Locale } from "../../../../../../../i18n.config";
import { getDictionary } from "@/lib/dictionary";

export const metadata: Metadata = {
  title: "Análisis de Datos en CDMX | imSoft",
  description:
    "Descubre cómo nuestro servicio de análisis de datos en CDMX te permite obtener insights valiosos para tu negocio. Especializados en Big Data y Business Intelligence para empresas en CDMX.",
  keywords: [
    "imSoft",
    "Análisis de datos en CDMX",
    "Big Data CDMX",
    "Business Intelligence CDMX",
    "Servicios de datos CDMX",
  ],
  twitter: {
    title: "Análisis de Datos",
    description:
      "Descubre cómo nuestro análisis de datos puede impulsar tu estrategia empresarial, optimizar operaciones y predecir tendencias futuras. Convierte datos en decisiones con imSoft.",
  },
  openGraph: {
    title: "Análisis de Datos",
    description:
      "Transforma datos en decisiones con nuestro análisis. Optimiza tu estrategia empresarial y anticipa tendencias con imSoft.",
  },
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
    page.services.locations.cdmx.services.dataAnalytics.featuresSection.serviceFeatures.map(
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
            page.services.locations.cdmx.services.dataAnalytics
              .introductorySection.title
          }
          description={
            page.services.locations.cdmx.services.dataAnalytics
              .introductorySection.title
          }
          callToAction1={
            page.services.locations.cdmx.services.dataAnalytics
              .introductorySection.title
          }
          callToAction2={
            page.services.locations.cdmx.services.dataAnalytics
              .introductorySection.title
          }
          callToAction3={
            page.services.locations.cdmx.services.dataAnalytics
              .introductorySection.title
          }
          lang={lang}
        />

        <FeaturesSection
          topic={
            page.services.locations.cdmx.services.dataAnalytics.featuresSection
              .topic
          }
          title={
            page.services.locations.cdmx.services.dataAnalytics.featuresSection
              .title
          }
          description={
            page.services.locations.cdmx.services.dataAnalytics.featuresSection
              .description
          }
          serviceFeatures={serviceFeatures}
        />

        <PriceSection
          topic={
            page.services.locations.cdmx.services.dataAnalytics.priceSection
              .topic
          }
          description={
            page.services.locations.cdmx.services.dataAnalytics.priceSection
              .description
          }
          listOfPackages={
            page.services.locations.cdmx.services.dataAnalytics.priceSection
              .listOfPackages
          }
          title={
            page.services.locations.cdmx.services.dataAnalytics.priceSection
              .title
          }
          whatIncludes={
            page.services.locations.cdmx.services.dataAnalytics.priceSection
              .whatIncludes
          }
          callToAction1={
            page.services.locations.cdmx.services.dataAnalytics.priceSection
              .callToAction1
          }
          callToAction2={
            page.services.locations.cdmx.services.dataAnalytics.priceSection
              .callToAction2
          }
          callToAction3={
            page.services.locations.cdmx.services.dataAnalytics.priceSection
              .callToAction3
          }
          callToAction4={
            page.services.locations.cdmx.services.dataAnalytics.priceSection
              .callToAction4
          }
          lang={lang}
        />

        <CallToActionSection
          imageUrl={
            page.services.locations.cdmx.services.dataAnalytics
              .callToActionSection.imageUrl
          }
          topic={
            page.services.locations.cdmx.services.dataAnalytics
              .callToActionSection.topic
          }
          title={
            page.services.locations.cdmx.services.dataAnalytics
              .callToActionSection.title
          }
          description={
            page.services.locations.cdmx.services.dataAnalytics
              .callToActionSection.description
          }
          callToAction={
            page.services.locations.cdmx.services.dataAnalytics
              .callToActionSection.callToAction
          }
          lang={lang}
        />
      </main>
    </>
  );
};

export default DataAnalitycsPage;
