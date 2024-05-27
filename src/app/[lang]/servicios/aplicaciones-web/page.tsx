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
import { Locale } from "../../../../../i18n.config";
import { getDictionary } from "@/lib/dictionary";

export const metadata: Metadata = {
  title: "Aplicaciones web",
  description:
    "Nuestras aplicaciones web pueden ayudarte a mejorar tu presencia en línea, aumentar la interacción con tus clientes, mejorar la automatización de tus procesos de negocio, y proporcionar una experiencia de usuario mejorada. También puedes estar seguro de que tu aplicación web será escalable y adaptable para satisfacer las necesidades futuras de tu negocio.",
  keywords: ["imSoft", "Aplicacines web"],
  twitter: {
    title: "Aplicaciones web",
    description:
      "Nuestras aplicaciones web pueden ayudarte a mejorar tu presencia en línea, aumentar la interacción con tus clientes, mejorar la automatización de tus procesos de negocio, y proporcionar una experiencia de usuario mejorada. También puedes estar seguro de que tu aplicación web será escalable y adaptable para satisfacer las necesidades futuras de tu negocio.",
  },
  openGraph: {
    title: "Aplicaciones web",
    description:
      "Nuestras aplicaciones web pueden ayudarte a mejorar tu presencia en línea, aumentar la interacción con tus clientes, mejorar la automatización de tus procesos de negocio, y proporcionar una experiencia de usuario mejorada. También puedes estar seguro de que tu aplicación web será escalable y adaptable para satisfacer las necesidades futuras de tu negocio.",
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

const WebAppPage = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}) => {
  const { page } = await getDictionary(lang);

  const serviceFeatures =
    page.services.webApplications.featuresSection.serviceFeatures.map(
      (feature: { title: string; description: string; icon: string }) => ({
        ...feature,
        icon: iconMapping[feature.icon] as HeroIcon,
      })
    );

  return (
    <>
      <main>
        <IntroductorySection
          title={page.services.webApplications.introductorySection.title}
          description={
            page.services.webApplications.introductorySection.description
          }
          callToAction1={
            page.services.webApplications.introductorySection.callToAction1
          }
          callToAction2={
            page.services.webApplications.introductorySection.callToAction2
          }
          callToAction3={
            page.services.webApplications.introductorySection.callToAction3
          }
          lang={lang}
        />

        <FeaturesSection
          topic={page.services.webApplications.featuresSection.topic}
          title={page.services.webApplications.featuresSection.title}
          description={
            page.services.webApplications.featuresSection.description
          }
          serviceFeatures={serviceFeatures}
        />

        <PriceSection
          topic={page.services.webApplications.priceSection.topic}
          description={page.services.webApplications.priceSection.description}
          listOfPackages={
            page.services.webApplications.priceSection.listOfPackages
          }
          title={page.services.webApplications.priceSection.title}
          whatIncludes={page.services.webApplications.priceSection.whatIncludes}
          callToAction1={
            page.services.webApplications.priceSection.callToAction1
          }
          callToAction2={
            page.services.webApplications.priceSection.callToAction2
          }
          callToAction3={
            page.services.webApplications.priceSection.callToAction3
          }
          callToAction4={
            page.services.webApplications.priceSection.callToAction4
          }
          lang={lang}
        />

        <CallToActionSection
          imageUrl={page.services.webApplications.callToActionSection.imageUrl}
          topic={page.services.webApplications.callToActionSection.topic}
          title={page.services.webApplications.callToActionSection.title}
          description={
            page.services.webApplications.callToActionSection.description
          }
          callToAction={
            page.services.webApplications.callToActionSection.callToAction
          }
          lang={lang}
        />
      </main>
    </>
  );
};

export default WebAppPage;
