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
  ChartBarIcon,
  CogIcon,
  DevicePhoneMobileIcon,
  WrenchIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { Locale } from "../../../../../../../i18n.config";
import { getDictionary } from "@/lib/dictionary";

export const metadata: Metadata = {
  title: "Desarrollo de Aplicaciones Web en Zapopan | imSoft",
  description:
    "En imSoft, creamos aplicaciones web personalizadas en Zapopan para potenciar tu negocio. Mejora tu presencia online, interactúa eficazmente con tus clientes y automatiza tus procesos de negocio con nuestras soluciones web. Diseñamos aplicaciones escalables y adaptables para el futuro de tu empresa en Zapopan.",
  keywords: [
    "imSoft",
    "Aplicaciones web Zapopan",
    "Desarrollo web Zapopan",
    "Soluciones web personalizadas",
  ],
  twitter: {
    title: "Desarrollo de Aplicaciones Web en Zapopan por imSoft",
    description:
      "Descubre cómo imSoft puede transformar tu negocio en Zapopan con aplicaciones web personalizadas. Aumenta tu presencia en línea y mejora la interacción con tus clientes con nuestras soluciones innovadoras.",
  },
  openGraph: {
    title: "Aplicaciones Web Personalizadas en Zapopan | imSoft",
    description:
      "Con imSoft, lleva tu negocio en Zapopan al siguiente nivel con aplicaciones web adaptadas a tus necesidades. Experiencia de usuario mejorada, escalabilidad y adaptabilidad para el futuro de tu empresa.",
  },
};

const iconMapping: { [key: string]: HeroIcon } = {
  PaintBrushIcon,
  ChartBarIcon,
  CogIcon,
  DevicePhoneMobileIcon,
  WrenchIcon,
  ShieldCheckIcon,
};

const WebAppPageZapopan = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}) => {
  const { page } = await getDictionary(lang);

  const serviceFeatures =
    page.services.locations.zapopan.services.webApplications.featuresSection.serviceFeatures.map(
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
            page.services.locations.zapopan.services.webApplications
              .introductorySection.title
          }
          description={
            page.services.locations.zapopan.services.webApplications
              .introductorySection.description
          }
          callToAction1={
            page.services.locations.zapopan.services.webApplications
              .introductorySection.callToAction1
          }
          callToAction2={
            page.services.locations.zapopan.services.webApplications
              .introductorySection.callToAction2
          }
          callToAction3={
            page.services.locations.zapopan.services.webApplications
              .introductorySection.callToAction3
          }
          lang={lang}
        />

        <FeaturesSection
          topic={
            page.services.locations.zapopan.services.webApplications
              .featuresSection.topic
          }
          title={
            page.services.locations.zapopan.services.webApplications
              .featuresSection.title
          }
          description={
            page.services.locations.zapopan.services.webApplications
              .featuresSection.description
          }
          serviceFeatures={serviceFeatures}
        />

        <PriceSection
          topic={
            page.services.locations.zapopan.services.webApplications
              .priceSection.topic
          }
          description={
            page.services.locations.zapopan.services.webApplications
              .priceSection.description
          }
          listOfPackages={
            page.services.locations.zapopan.services.webApplications
              .priceSection.listOfPackages
          }
          title={
            page.services.locations.zapopan.services.webApplications
              .priceSection.title
          }
          whatIncludes={
            page.services.locations.zapopan.services.webApplications
              .priceSection.whatIncludes
          }
          callToAction1={
            page.services.locations.zapopan.services.webApplications
              .priceSection.callToAction1
          }
          callToAction2={
            page.services.locations.zapopan.services.webApplications
              .priceSection.callToAction2
          }
          callToAction3={
            page.services.locations.zapopan.services.webApplications
              .priceSection.callToAction3
          }
          callToAction4={
            page.services.locations.zapopan.services.webApplications
              .priceSection.callToAction4
          }
          lang={lang}
        />

        <CallToActionSection
          imageUrl={
            page.services.locations.zapopan.services.webApplications
              .callToActionSection.imageUrl
          }
          topic={
            page.services.locations.zapopan.services.webApplications
              .callToActionSection.topic
          }
          title={
            page.services.locations.zapopan.services.webApplications
              .callToActionSection.title
          }
          description={
            page.services.locations.zapopan.services.webApplications
              .callToActionSection.description
          }
          callToAction={
            page.services.locations.zapopan.services.webApplications
              .callToActionSection.callToAction
          }
          lang={lang}
        />
      </main>
    </>
  );
};

export default WebAppPageZapopan;
