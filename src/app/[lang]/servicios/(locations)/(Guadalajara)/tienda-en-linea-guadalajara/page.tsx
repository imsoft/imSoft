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
  UserGroupIcon,
  ClockIcon,
  PresentationChartBarIcon,
  ArrowUpIcon,
  ArrowTrendingUpIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { Locale } from "../../../../../../../i18n.config";
import { getDictionary } from "@/lib/dictionary";

export const metadata: Metadata = {
  title: "Tienda en Línea en Guadalajara | imSoft",
  description:
    "Crea y expande tu tienda en línea en Guadalajara con imSoft. Ofrecemos soluciones personalizadas para llevar tu negocio al éxito digital.",
  keywords: [
    "imSoft",
    "Tienda en línea",
    "Tienda en línea Guadalajara",
    "Comercio Electrónico Guadalajara",
  ],
  twitter: {
    title: "Tienda en Línea en Guadalajara - imSoft",
    description:
      "Descubre cómo imSoft puede transformar tu negocio en Guadalajara con una tienda en línea personalizada. Estamos listos para llevar tu negocio al siguiente nivel en el mundo del comercio electrónico.",
  },
  openGraph: {
    title: "Tienda en Línea Personalizada en Guadalajara | imSoft",
    description:
      "En imSoft, somos expertos en crear tiendas en línea que se destacan en Guadalajara. Contacta para una solución a medida y lleva tu negocio a nuevos horizontes digitales.",
  },
};

const iconMapping: { [key: string]: HeroIcon } = {
  UserGroupIcon,
  ClockIcon,
  PresentationChartBarIcon,
  ArrowUpIcon,
  ArrowTrendingUpIcon,
  ShoppingBagIcon,
};

const EcommercePage = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}) => {
  const { page } = await getDictionary(lang);

  const serviceFeatures =
    page.services.locations.guadalajara.services.ecommerce.featuresSection.serviceFeatures.map(
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
            page.services.locations.guadalajara.services.ecommerce
              .introductorySection.title
          }
          description={
            page.services.locations.guadalajara.services.ecommerce
              .introductorySection.description
          }
          callToAction1={
            page.services.locations.guadalajara.services.ecommerce
              .introductorySection.callToAction1
          }
          callToAction2={
            page.services.locations.guadalajara.services.ecommerce
              .introductorySection.callToAction2
          }
          callToAction3={
            page.services.locations.guadalajara.services.ecommerce
              .introductorySection.callToAction3
          }
          lang={lang}
        />

        <FeaturesSection
          topic={
            page.services.locations.guadalajara.services.ecommerce
              .featuresSection.topic
          }
          title={
            page.services.locations.guadalajara.services.ecommerce
              .featuresSection.title
          }
          description={
            page.services.locations.guadalajara.services.ecommerce
              .featuresSection.description
          }
          serviceFeatures={serviceFeatures}
        />

        <PriceSection
          topic={
            page.services.locations.guadalajara.services.ecommerce.priceSection
              .topic
          }
          description={
            page.services.locations.guadalajara.services.ecommerce.priceSection
              .description
          }
          listOfPackages={
            page.services.locations.guadalajara.services.ecommerce.priceSection
              .listOfPackages
          }
          title={
            page.services.locations.guadalajara.services.ecommerce.priceSection
              .title
          }
          whatIncludes={
            page.services.locations.guadalajara.services.ecommerce.priceSection
              .whatIncludes
          }
          callToAction1={
            page.services.locations.guadalajara.services.ecommerce.priceSection
              .callToAction1
          }
          callToAction2={
            page.services.locations.guadalajara.services.ecommerce.priceSection
              .callToAction2
          }
          callToAction3={
            page.services.locations.guadalajara.services.ecommerce.priceSection
              .callToAction3
          }
          callToAction4={
            page.services.locations.guadalajara.services.ecommerce.priceSection
              .callToAction4
          }
          lang={lang}
        />

        <CallToActionSection
          imageUrl={
            page.services.locations.guadalajara.services.ecommerce
              .callToActionSection.imageUrl
          }
          topic={
            page.services.locations.guadalajara.services.ecommerce
              .callToActionSection.topic
          }
          title={
            page.services.locations.guadalajara.services.ecommerce
              .callToActionSection.title
          }
          description={
            page.services.locations.guadalajara.services.ecommerce
              .callToActionSection.description
          }
          callToAction={
            page.services.locations.guadalajara.services.ecommerce
              .callToActionSection.callToAction
          }
          lang={lang}
        />
      </main>
    </>
  );
};

export default EcommercePage;
