import { Metadata } from "next";
import {
  IntroductorySection,
  FeaturesSection,
  CallToActionSection,
  PriceSection,
} from "@/components/ui/services";
import type { HeroIcon } from "@/interfaces";
import {
  UserGroupIcon,
  ClockIcon,
  PresentationChartBarIcon,
  ArrowUpIcon,
  ArrowTrendingUpIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { Locale } from "../../../../../i18n.config";
import { getDictionary } from "@/lib/dictionary";

export const metadata: Metadata = {
  title: "Tienda en línea",
  description:
    "Si estás buscando expandir tu negocio y llevar tus productos o servicios a una audiencia más amplia, una tienda en línea es una excelente opción. Si estás listo para llevar tu negocio al siguiente nivel, no dudes en contactarme y solicitar una cotización. Estoy seguro de que podemos ayudarte a alcanzar tus objetivos y a tener éxito en el mundo de las tiendas en línea",
  keywords: ["imSoft", "Tienda en línea"],
  twitter: {
    title: "Tienda en línea",
    description:
      "Si estás buscando expandir tu negocio y llevar tus productos o servicios a una audiencia más amplia, una tienda en línea es una excelente opción. Si estás listo para llevar tu negocio al siguiente nivel, no dudes en contactarme y solicitar una cotización. Estoy seguro de que podemos ayudarte a alcanzar tus objetivos y a tener éxito en el mundo de las Tienda en línea",
  },
  openGraph: {
    title: "Tienda en línea",
    description:
      "Si estás buscando expandir tu negocio y llevar tus productos o servicios a una audiencia más amplia, una tienda en línea es una excelente opción. Si estás listo para llevar tu negocio al siguiente nivel, no dudes en contactarme y solicitar una cotización. Estoy seguro de que podemos ayudarte a alcanzar tus objetivos y a tener éxito en el mundo de las Tienda en línea",
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
    page.services.ecommerce.featuresSection.serviceFeatures.map(
      (feature: { title: string; description: string; icon: string }) => ({
        ...feature,
        icon: iconMapping[feature.icon] as HeroIcon,
      })
    );

  return (
    <>
      <main>
        <IntroductorySection
          title={page.services.ecommerce.introductorySection.title}
          description={page.services.ecommerce.introductorySection.description}
          callToAction1={
            page.services.ecommerce.introductorySection.callToAction1
          }
          callToAction2={
            page.services.ecommerce.introductorySection.callToAction2
          }
          callToAction3={
            page.services.ecommerce.introductorySection.callToAction3
          }
          lang={lang}
        />

        <FeaturesSection
          topic={page.services.ecommerce.featuresSection.topic}
          title={page.services.ecommerce.featuresSection.title}
          description={page.services.ecommerce.featuresSection.description}
          serviceFeatures={serviceFeatures}
        />

        <PriceSection
          topic={page.services.ecommerce.priceSection.topic}
          description={page.services.ecommerce.priceSection.description}
          listOfPackages={page.services.ecommerce.priceSection.listOfPackages}
          title={page.services.ecommerce.priceSection.title}
          whatIncludes={page.services.ecommerce.priceSection.whatIncludes}
          callToAction1={page.services.ecommerce.priceSection.callToAction1}
          callToAction2={page.services.ecommerce.priceSection.callToAction2}
          callToAction3={page.services.ecommerce.priceSection.callToAction3}
          callToAction4={page.services.ecommerce.priceSection.callToAction4}
          lang={lang}
        />

        <CallToActionSection
          imageUrl={page.services.ecommerce.callToActionSection.imageUrl}
          topic={page.services.ecommerce.callToActionSection.topic}
          title={page.services.ecommerce.callToActionSection.title}
          description={page.services.ecommerce.callToActionSection.description}
          callToAction={
            page.services.ecommerce.callToActionSection.callToAction
          }
          lang={lang}
        />
      </main>
    </>
  );
};

export default EcommercePage;
