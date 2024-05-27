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
  BuildingStorefrontIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  PencilSquareIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { Locale } from "../../../../../i18n.config";
import { getDictionary } from "@/lib/dictionary";

export const metadata: Metadata = {
  title: "SEO",
  description:
    "Si quieres que tu negocio tenga éxito en línea, es esencial que tenga una buena presencia en los resultados de búsqueda de Google. El posicionamiento SEO no es algo que se logre de la noche a la mañana, sino que requiere de una estrategia bien planificada y de técnicas especializadas. Es aquí donde entran mis servicios de desarrollo de posicionamiento SEO. Si quieres que tu negocio alcance nuevos clientes y aumente sus ventas en línea, no dudes en contactarme y solicitar una cotización. Estoy seguro de que podemos ayudarte a alcanzar tus objetivos y a tener éxito en el mundo digital",
  keywords: [
    "imSoft",
    "SEO",
    "Posicionamiento SEO",
    "Análisis de palabras clave",
  ],
  twitter: {
    title: "SEO",
    description:
      "Si quieres que tu negocio tenga éxito en línea, es esencial que tenga una buena presencia en los resultados de búsqueda de Google. El posicionamiento SEO no es algo que se logre de la noche a la mañana, sino que requiere de una estrategia bien planificada y de técnicas especializadas. Es aquí donde entran mis servicios de desarrollo de posicionamiento SEO. Si quieres que tu negocio alcance nuevos clientes y aumente sus ventas en línea, no dudes en contactarme y solicitar una cotización. Estoy seguro de que podemos ayudarte a alcanzar tus objetivos y a tener éxito en el mundo digital",
  },
  openGraph: {
    title: "SEO",
    description:
      "Si quieres que tu negocio tenga éxito en línea, es esencial que tenga una buena presencia en los resultados de búsqueda de Google. El posicionamiento SEO no es algo que se logre de la noche a la mañana, sino que requiere de una estrategia bien planificada y de técnicas especializadas. Es aquí donde entran mis servicios de desarrollo de posicionamiento SEO. Si quieres que tu negocio alcance nuevos clientes y aumente sus ventas en línea, no dudes en contactarme y solicitar una cotización. Estoy seguro de que podemos ayudarte a alcanzar tus objetivos y a tener éxito en el mundo digital",
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
    page.services.positioningSeo.featuresSection.serviceFeatures.map(
      (feature: { title: string; description: string; icon: string }) => ({
        ...feature,
        icon: iconMapping[feature.icon] as HeroIcon,
      })
    );

  return (
    <>
      <main>
        <IntroductorySection
          title={page.services.positioningSeo.introductorySection.title}
          description={
            page.services.positioningSeo.introductorySection.description
          }
          callToAction1={
            page.services.positioningSeo.introductorySection.callToAction1
          }
          callToAction2={
            page.services.positioningSeo.introductorySection.callToAction2
          }
          callToAction3={
            page.services.positioningSeo.introductorySection.callToAction3
          }
          lang={lang}
        />

        <FeaturesSection
          topic={page.services.positioningSeo.featuresSection.topic}
          title={page.services.positioningSeo.featuresSection.title}
          description={page.services.positioningSeo.featuresSection.description}
          serviceFeatures={serviceFeatures}
        />

        <PriceSection
          topic={page.services.positioningSeo.priceSection.topic}
          description={page.services.positioningSeo.priceSection.description}
          listOfPackages={
            page.services.positioningSeo.priceSection.listOfPackages
          }
          title={page.services.positioningSeo.priceSection.title}
          whatIncludes={page.services.positioningSeo.priceSection.whatIncludes}
          callToAction1={
            page.services.positioningSeo.priceSection.callToAction1
          }
          callToAction2={
            page.services.positioningSeo.priceSection.callToAction2
          }
          callToAction3={
            page.services.positioningSeo.priceSection.callToAction3
          }
          callToAction4={
            page.services.positioningSeo.priceSection.callToAction4
          }
          lang={lang}
        />

        <CallToActionSection
          imageUrl={page.services.positioningSeo.callToActionSection.imageUrl}
          topic={page.services.positioningSeo.callToActionSection.topic}
          title={page.services.positioningSeo.callToActionSection.title}
          description={
            page.services.positioningSeo.callToActionSection.description
          }
          callToAction={
            page.services.positioningSeo.callToActionSection.callToAction
          }
          lang={lang}
        />
      </main>
    </>
  );
};

export default SEOPage;
