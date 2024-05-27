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

export const metadata: Metadata = {
  title: "Análisis de Datos",
  description:
    "Nuestro servicio de análisis de datos te permite descubrir patrones y obtener insights valiosos para impulsar la toma de decisiones estratégicas. Transformamos grandes volúmenes de datos en información clara y accionable, ayudándote a entender mejor a tus clientes, optimizar operaciones y predecir tendencias futuras. Nuestros sistemas son escalables y se adaptan a las necesidades cambiantes de tu negocio.",
  keywords: [
    "imSoft",
    "Análisis de datos",
    "Big Data",
    "Business Intelligence",
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
