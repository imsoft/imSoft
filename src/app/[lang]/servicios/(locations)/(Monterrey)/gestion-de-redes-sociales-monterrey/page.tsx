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
  PhotoIcon,
  PresentationChartBarIcon,
  UsersIcon,
  EyeIcon,
  PresentationChartLineIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";
import { Metadata } from "next";
import { Locale } from "../../../../../../../i18n.config";
import { getDictionary } from "@/lib/dictionary";

export const metadata: Metadata = {
  title: "Gestión Profesional de Redes Sociales en Monterrey | imSoft",
  description:
    "Eleva tu presencia en línea en Monterrey con nuestro servicio integral de gestión de redes sociales. Conectamos tu marca con la audiencia local a través de contenido dinámico y estrategias adaptadas.",
  keywords: [
    "imSoft",
    "Gestión de Redes Sociales en Monterrey",
    "Marketing Digital Monterrey",
    "Engagement Social Monterrey",
  ],
  twitter: {
    title: "Gestión Profesional de Redes Sociales",
    description:
      "Eleva tu marca en redes sociales con nuestra gestión experta. Contenido dinámico, interacción auténtica y estrategias de crecimiento para tu negocio.",
  },
  openGraph: {
    title: "Gestión Profesional de Redes Sociales",
    description:
      "Transforma tu presencia en redes con gestión experta. Aprovecha al máximo cada plataforma para crecer y conectar con tu audiencia.",
  },
};

const iconMapping: { [key: string]: HeroIcon } = {
  PhotoIcon,
  PresentationChartBarIcon,
  UsersIcon,
  EyeIcon,
  PresentationChartLineIcon,
  BellAlertIcon,
};

const SocialMediaManagementPage = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}) => {
  const { page } = await getDictionary(lang);

  const serviceFeatures =
    page.services.locations.monterrey.services.socialNetworkManagement.featuresSection.serviceFeatures.map(
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
            page.services.locations.monterrey.services.socialNetworkManagement
              .introductorySection.title
          }
          description={
            page.services.locations.monterrey.services.socialNetworkManagement
              .introductorySection.description
          }
          callToAction1={
            page.services.locations.monterrey.services.socialNetworkManagement
              .introductorySection.callToAction1
          }
          callToAction2={
            page.services.locations.monterrey.services.socialNetworkManagement
              .introductorySection.callToAction2
          }
          callToAction3={
            page.services.locations.monterrey.services.socialNetworkManagement
              .introductorySection.callToAction3
          }
          lang={lang}
        />

        <FeaturesSection
          topic={
            page.services.locations.monterrey.services.socialNetworkManagement
              .featuresSection.topic
          }
          title={
            page.services.locations.monterrey.services.socialNetworkManagement
              .featuresSection.title
          }
          description={
            page.services.locations.monterrey.services.socialNetworkManagement
              .featuresSection.description
          }
          serviceFeatures={serviceFeatures}
        />

        <PriceSection
          topic={
            page.services.locations.monterrey.services.socialNetworkManagement
              .priceSection.topic
          }
          description={
            page.services.locations.monterrey.services.socialNetworkManagement
              .priceSection.description
          }
          listOfPackages={
            page.services.locations.monterrey.services.socialNetworkManagement
              .priceSection.listOfPackages
          }
          title={
            page.services.locations.monterrey.services.socialNetworkManagement
              .priceSection.title
          }
          whatIncludes={
            page.services.locations.monterrey.services.socialNetworkManagement
              .priceSection.whatIncludes
          }
          callToAction1={
            page.services.locations.monterrey.services.socialNetworkManagement
              .priceSection.callToAction1
          }
          callToAction2={
            page.services.locations.monterrey.services.socialNetworkManagement
              .priceSection.callToAction2
          }
          callToAction3={
            page.services.locations.monterrey.services.socialNetworkManagement
              .priceSection.callToAction3
          }
          callToAction4={
            page.services.locations.monterrey.services.socialNetworkManagement
              .priceSection.callToAction4
          }
          lang={lang}
        />

        <CallToActionSection
          imageUrl={
            page.services.locations.monterrey.services.socialNetworkManagement
              .callToActionSection.imageUrl
          }
          topic={
            page.services.locations.monterrey.services.socialNetworkManagement
              .callToActionSection.topic
          }
          title={
            page.services.locations.monterrey.services.socialNetworkManagement
              .callToActionSection.title
          }
          description={
            page.services.locations.monterrey.services.socialNetworkManagement
              .callToActionSection.description
          }
          callToAction={
            page.services.locations.monterrey.services.socialNetworkManagement
              .callToActionSection.callToAction
          }
          lang={lang}
        />
      </main>
    </>
  );
};

export default SocialMediaManagementPage;
