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
  ChevronDoubleDownIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { Locale } from "../../../../../../../i18n.config";
import { getDictionary } from "@/lib/dictionary";

export const metadata: Metadata = {
  title: "Desarrollo de Aplicaciones Móviles en CDMX | imSoft",
  description:
    "Especialistas en desarrollo de aplicaciones móviles a medida en CDMX, diseñadas para impulsar el engagement de los usuarios y contribuir al crecimiento de tu negocio local.",
  keywords: [
    "imSoft",
    "Aplicaciones móviles en CDMX",
    "Desarrollo móvil CDMX",
    "Apps CDMX",
  ],
  twitter: {
    title: "Desarrollo de Aplicaciones Móviles",
    description:
      "Impulsa tu negocio con aplicaciones móviles a medida. Mejora la experiencia de tus usuarios y abre nuevas vías de interacción y crecimiento con imSoft.",
  },
  openGraph: {
    title: "Desarrollo de Aplicaciones Móviles",
    description:
      "Transforma tu estrategia digital con nuestras soluciones móviles personalizadas. Escalabilidad, seguridad y diseño centrado en el usuario con imSoft.",
  },
};

const iconMapping: { [key: string]: HeroIcon } = {
  ChevronDoubleDownIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
};

const MobileAppsPage = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}) => {
  const { page } = await getDictionary(lang);

  const serviceFeatures =
    page.services.locations.cdmx.services.mobileApps.featuresSection.serviceFeatures.map(
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
            page.services.locations.cdmx.services.mobileApps.introductorySection
              .title
          }
          description={
            page.services.locations.cdmx.services.mobileApps.introductorySection
              .description
          }
          callToAction1={
            page.services.locations.cdmx.services.mobileApps.introductorySection
              .callToAction1
          }
          callToAction2={
            page.services.locations.cdmx.services.mobileApps.introductorySection
              .callToAction2
          }
          callToAction3={
            page.services.locations.cdmx.services.mobileApps.introductorySection
              .callToAction3
          }
          lang={lang}
        />

        <FeaturesSection
          topic={
            page.services.locations.cdmx.services.mobileApps.featuresSection
              .topic
          }
          title={
            page.services.locations.cdmx.services.mobileApps.featuresSection
              .title
          }
          description={
            page.services.locations.cdmx.services.mobileApps.featuresSection
              .description
          }
          serviceFeatures={serviceFeatures}
        />

        <PriceSection
          topic={
            page.services.locations.cdmx.services.mobileApps.priceSection.topic
          }
          description={
            page.services.locations.cdmx.services.mobileApps.priceSection
              .description
          }
          listOfPackages={
            page.services.locations.cdmx.services.mobileApps.priceSection
              .listOfPackages
          }
          title={
            page.services.locations.cdmx.services.mobileApps.priceSection.title
          }
          whatIncludes={
            page.services.locations.cdmx.services.mobileApps.priceSection
              .whatIncludes
          }
          callToAction1={
            page.services.locations.cdmx.services.mobileApps.priceSection
              .callToAction1
          }
          callToAction2={
            page.services.locations.cdmx.services.mobileApps.priceSection
              .callToAction2
          }
          callToAction3={
            page.services.locations.cdmx.services.mobileApps.priceSection
              .callToAction3
          }
          callToAction4={
            page.services.locations.cdmx.services.mobileApps.priceSection
              .callToAction4
          }
          lang={lang}
        />

        <CallToActionSection
          imageUrl={
            page.services.locations.cdmx.services.mobileApps.callToActionSection
              .imageUrl
          }
          topic={
            page.services.locations.cdmx.services.mobileApps.callToActionSection
              .topic
          }
          title={
            page.services.locations.cdmx.services.mobileApps.callToActionSection
              .title
          }
          description={
            page.services.locations.cdmx.services.mobileApps.callToActionSection
              .description
          }
          callToAction={
            page.services.locations.cdmx.services.mobileApps.callToActionSection
              .callToAction
          }
          lang={lang}
        />
      </main>
    </>
  );
};

export default MobileAppsPage;
