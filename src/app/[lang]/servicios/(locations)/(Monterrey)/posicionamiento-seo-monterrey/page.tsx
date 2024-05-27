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

export const metadata: Metadata = {
  title: "Servicios de SEO en Monterrey | imSoft",
  description:
    "Optimiza tu presencia online en Monterrey con nuestros servicios de SEO. Estrategias personalizadas para impulsar tu negocio en los resultados de búsqueda de Google.",
  keywords: [
    "imSoft",
    "SEO Monterrey",
    "Posicionamiento SEO Monterrey",
    "Servicios SEO Monterrey",
    "Análisis de palabras clave",
  ],
  twitter: {
    title: "SEO en Monterrey | imSoft",
    description:
      "Aumenta la visibilidad de tu negocio en Monterrey con nuestro SEO especializado. Estrategias y técnicas para dominar los resultados de Google.",
  },
  openGraph: {
    title: "Optimización SEO en Monterrey | imSoft",
    description:
      "Con nuestros servicios de SEO en Monterrey, tu negocio alcanzará nuevas alturas en el mundo digital. Contáctanos para mejorar tu ranking en Google.",
  },
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
    page.services.locations.monterrey.services.positioningSeo.featuresSection.serviceFeatures.map(
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
            page.services.locations.monterrey.services.positioningSeo
              .introductorySection.title
          }
          description={
            page.services.locations.monterrey.services.positioningSeo
              .introductorySection.description
          }
          callToAction1={
            page.services.locations.monterrey.services.positioningSeo
              .introductorySection.callToAction1
          }
          callToAction2={
            page.services.locations.monterrey.services.positioningSeo
              .introductorySection.callToAction2
          }
          callToAction3={
            page.services.locations.monterrey.services.positioningSeo
              .introductorySection.callToAction3
          }
          lang={lang}
        />

        <FeaturesSection
          topic={
            page.services.locations.monterrey.services.positioningSeo
              .featuresSection.topic
          }
          title={
            page.services.locations.monterrey.services.positioningSeo
              .featuresSection.title
          }
          description={
            page.services.locations.monterrey.services.positioningSeo
              .featuresSection.description
          }
          serviceFeatures={serviceFeatures}
        />

        <PriceSection
          topic={
            page.services.locations.monterrey.services.positioningSeo
              .priceSection.topic
          }
          description={
            page.services.locations.monterrey.services.positioningSeo
              .priceSection.description
          }
          listOfPackages={
            page.services.locations.monterrey.services.positioningSeo
              .priceSection.listOfPackages
          }
          title={
            page.services.locations.monterrey.services.positioningSeo
              .priceSection.title
          }
          whatIncludes={
            page.services.locations.monterrey.services.positioningSeo
              .priceSection.whatIncludes
          }
          callToAction1={
            page.services.locations.monterrey.services.positioningSeo
              .priceSection.callToAction1
          }
          callToAction2={
            page.services.locations.monterrey.services.positioningSeo
              .priceSection.callToAction2
          }
          callToAction3={
            page.services.locations.monterrey.services.positioningSeo
              .priceSection.callToAction3
          }
          callToAction4={
            page.services.locations.monterrey.services.positioningSeo
              .priceSection.callToAction4
          }
          lang={lang}
        />

        <CallToActionSection
          imageUrl={
            page.services.locations.monterrey.services.positioningSeo
              .callToActionSection.imageUrl
          }
          topic={
            page.services.locations.monterrey.services.positioningSeo
              .callToActionSection.topic
          }
          title={
            page.services.locations.monterrey.services.positioningSeo
              .callToActionSection.title
          }
          description={
            page.services.locations.monterrey.services.positioningSeo
              .callToActionSection.description
          }
          callToAction={
            page.services.locations.monterrey.services.positioningSeo
              .callToActionSection.callToAction
          }
          lang={lang}
        />
      </main>
    </>
  );
};

export default SEOPage;