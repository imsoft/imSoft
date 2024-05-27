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
  CubeTransparentIcon,
  PresentationChartLineIcon,
  EyeIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { Metadata } from "next";
import { Locale } from "../../../../../../../i18n.config";
import { getDictionary } from "@/lib/dictionary";

export const metadata: Metadata = {
  title: "Gestión de Campañas de Redes Sociales en Guadalajara | imSoft",
  description:
    "Maximiza tu impacto en Guadalajara con nuestras campañas de redes sociales personalizadas. Aumenta la visibilidad y el engagement de tu marca localmente.",
  keywords: [
    "imSoft",
    "Campañas de Redes Sociales en Guadalajara",
    "Marketing Digital Guadalajara",
    "Engagement Guadalajara",
  ],
  twitter: {
    title: "Gestión de Campañas de Redes Sociales",
    description:
      "Impulsa tu presencia en línea con estrategias de redes sociales que capturan y retienen la atención de tu audiencia. Con imSoft, transforma tus redes en canales de crecimiento.",
  },
  openGraph: {
    title: "Gestión de Campañas de Redes Sociales",
    description:
      "Eleva tu estrategia de marketing con campañas de redes sociales que conectan, convierten y retienen. Descubre el poder de una comunicación efectiva con imSoft.",
  },
};

const iconMapping: { [key: string]: HeroIcon } = {
  PaintBrushIcon,
  CubeTransparentIcon,
  PresentationChartLineIcon,
  EyeIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
};

const SocialMediaCampainsPage = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}) => {
  const { page } = await getDictionary(lang);

  const serviceFeatures =
    page.services.locations.guadalajara.services.campaignsOnSocialNetworks.featuresSection.serviceFeatures.map(
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
            page.services.locations.guadalajara.services
              .campaignsOnSocialNetworks.introductorySection.title
          }
          description={
            page.services.locations.guadalajara.services
              .campaignsOnSocialNetworks.introductorySection.description
          }
          callToAction1={
            page.services.locations.guadalajara.services
              .campaignsOnSocialNetworks.introductorySection.callToAction1
          }
          callToAction2={
            page.services.locations.guadalajara.services
              .campaignsOnSocialNetworks.introductorySection.callToAction2
          }
          callToAction3={
            page.services.locations.guadalajara.services
              .campaignsOnSocialNetworks.introductorySection.callToAction3
          }
          lang={lang}
        />

        <FeaturesSection
          topic={
            page.services.locations.guadalajara.services
              .campaignsOnSocialNetworks.featuresSection.topic
          }
          title={
            page.services.locations.guadalajara.services
              .campaignsOnSocialNetworks.featuresSection.title
          }
          description={
            page.services.locations.guadalajara.services
              .campaignsOnSocialNetworks.featuresSection.description
          }
          serviceFeatures={serviceFeatures}
        />

        <PriceSection
          topic={
            page.services.locations.guadalajara.services
              .campaignsOnSocialNetworks.priceSection.topic
          }
          description={
            page.services.locations.guadalajara.services
              .campaignsOnSocialNetworks.priceSection.description
          }
          listOfPackages={
            page.services.locations.guadalajara.services
              .campaignsOnSocialNetworks.priceSection.listOfPackages
          }
          title={
            page.services.locations.guadalajara.services
              .campaignsOnSocialNetworks.priceSection.title
          }
          whatIncludes={
            page.services.locations.guadalajara.services
              .campaignsOnSocialNetworks.priceSection.whatIncludes
          }
          callToAction1={
            page.services.locations.guadalajara.services
              .campaignsOnSocialNetworks.priceSection.callToAction1
          }
          callToAction2={
            page.services.locations.guadalajara.services
              .campaignsOnSocialNetworks.priceSection.callToAction2
          }
          callToAction3={
            page.services.locations.guadalajara.services
              .campaignsOnSocialNetworks.priceSection.callToAction3
          }
          callToAction4={
            page.services.locations.guadalajara.services
              .campaignsOnSocialNetworks.priceSection.callToAction4
          }
          lang={lang}
        />

        <CallToActionSection
          imageUrl={
            page.services.locations.guadalajara.services
              .campaignsOnSocialNetworks.callToActionSection.imageUrl
          }
          topic={
            page.services.locations.guadalajara.services
              .campaignsOnSocialNetworks.callToActionSection.topic
          }
          title={
            page.services.locations.guadalajara.services
              .campaignsOnSocialNetworks.callToActionSection.title
          }
          description={
            page.services.locations.guadalajara.services
              .campaignsOnSocialNetworks.callToActionSection.description
          }
          callToAction={
            page.services.locations.guadalajara.services
              .campaignsOnSocialNetworks.callToActionSection.callToAction
          }
          lang={lang}
        />
      </main>
    </>
  );
};

export default SocialMediaCampainsPage;
