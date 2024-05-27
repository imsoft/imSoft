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

export const metadata: Metadata = {
  title: "Análisis de Datos en Zapopan | imSoft",
  description:
    "Descubre patrones y obtén insights valiosos en Zapopan con nuestro servicio de análisis de datos. Ayudamos a tu negocio a tomar decisiones estratégicas basadas en datos claros y accionables.",
  keywords: [
    "imSoft",
    "Análisis de datos Zapopan",
    "Big Data Zapopan",
    "Business Intelligence Zapopan",
    "Análisis predictivo Zapopan",
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
    page.services.locations.zapopan.services.dataAnalytics.featuresSection.serviceFeatures.map(
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
            page.services.locations.zapopan.services.dataAnalytics
              .introductorySection.title
          }
          description={
            page.services.locations.zapopan.services.dataAnalytics
              .introductorySection.description
          }
          callToAction1={
            page.services.locations.zapopan.services.dataAnalytics
              .introductorySection.callToAction1
          }
          callToAction2={
            page.services.locations.zapopan.services.dataAnalytics
              .introductorySection.callToAction2
          }
          callToAction3={
            page.services.locations.zapopan.services.dataAnalytics
              .introductorySection.callToAction3
          }
          lang={lang}
        />

        <FeaturesSection
          topic={
            page.services.locations.zapopan.services.dataAnalytics
              .featuresSection.topic
          }
          title={
            page.services.locations.zapopan.services.dataAnalytics
              .featuresSection.title
          }
          description={
            page.services.locations.zapopan.services.dataAnalytics
              .featuresSection.description
          }
          serviceFeatures={serviceFeatures}
        />

        <PriceSection
          topic={
            page.services.locations.zapopan.services.dataAnalytics.priceSection
              .topic
          }
          description={
            page.services.locations.zapopan.services.dataAnalytics.priceSection
              .description
          }
          listOfPackages={
            page.services.locations.zapopan.services.dataAnalytics.priceSection
              .listOfPackages
          }
          title={
            page.services.locations.zapopan.services.dataAnalytics.priceSection
              .title
          }
          whatIncludes={
            page.services.locations.zapopan.services.dataAnalytics.priceSection
              .whatIncludes
          }
          callToAction1={
            page.services.locations.zapopan.services.dataAnalytics.priceSection
              .callToAction1
          }
          callToAction2={
            page.services.locations.zapopan.services.dataAnalytics.priceSection
              .callToAction2
          }
          callToAction3={
            page.services.locations.zapopan.services.dataAnalytics.priceSection
              .callToAction3
          }
          callToAction4={
            page.services.locations.zapopan.services.dataAnalytics.priceSection
              .callToAction4
          }
          lang={lang}
        />

        <CallToActionSection
          imageUrl={
            page.services.locations.zapopan.services.dataAnalytics
              .callToActionSection.imageUrl
          }
          topic={
            page.services.locations.zapopan.services.dataAnalytics
              .callToActionSection.topic
          }
          title={
            page.services.locations.zapopan.services.dataAnalytics
              .callToActionSection.title
          }
          description={
            page.services.locations.zapopan.services.dataAnalytics
              .callToActionSection.description
          }
          callToAction={
            page.services.locations.zapopan.services.dataAnalytics
              .callToActionSection.callToAction
          }
          lang={lang}
        />
      </main>
    </>
  );
};

export default DataAnalitycsPage;
