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
  title: "Gestión Profesional de Redes Sociales en Tlaquepaque | imSoft",
  description:
    "Eleva tu presencia en línea en Tlaquepaque con nuestro servicio integral de gestión de redes sociales. Administramos tus perfiles con contenido dinámico y estrategias de crecimiento adaptadas.",
  keywords: [
    "imSoft",
    "Gestión de Redes Sociales en Tlaquepaque",
    "Marketing Digital Tlaquepaque",
    "Engagement Social Tlaquepaque",
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
    page.services.locations.tlaquepaque.services.socialNetworkManagement.featuresSection.serviceFeatures.map(
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
            page.services.locations.tlaquepaque.services.socialNetworkManagement
              .introductorySection.title
          }
          description={
            page.services.locations.tlaquepaque.services.socialNetworkManagement
              .introductorySection.description
          }
          callToAction1={
            page.services.locations.tlaquepaque.services.socialNetworkManagement
              .introductorySection.callToAction1
          }
          callToAction2={
            page.services.locations.tlaquepaque.services.socialNetworkManagement
              .introductorySection.callToAction2
          }
          callToAction3={
            page.services.locations.tlaquepaque.services.socialNetworkManagement
              .introductorySection.callToAction3
          }
          lang={lang}
        />

        <FeaturesSection
          topic={
            page.services.locations.tlaquepaque.services.socialNetworkManagement
              .featuresSection.topic
          }
          title={
            page.services.locations.tlaquepaque.services.socialNetworkManagement
              .featuresSection.title
          }
          description={
            page.services.locations.tlaquepaque.services.socialNetworkManagement
              .featuresSection.description
          }
          serviceFeatures={serviceFeatures}
        />

        <PriceSection
          topic={
            page.services.locations.tlaquepaque.services.socialNetworkManagement
              .priceSection.topic
          }
          description={
            page.services.locations.tlaquepaque.services.socialNetworkManagement
              .priceSection.description
          }
          listOfPackages={
            page.services.locations.tlaquepaque.services.socialNetworkManagement
              .priceSection.listOfPackages
          }
          title={
            page.services.locations.tlaquepaque.services.socialNetworkManagement
              .priceSection.title
          }
          whatIncludes={
            page.services.locations.tlaquepaque.services.socialNetworkManagement
              .priceSection.whatIncludes
          }
          callToAction1={
            page.services.locations.tlaquepaque.services.socialNetworkManagement
              .priceSection.callToAction1
          }
          callToAction2={
            page.services.locations.tlaquepaque.services.socialNetworkManagement
              .priceSection.callToAction2
          }
          callToAction3={
            page.services.locations.tlaquepaque.services.socialNetworkManagement
              .priceSection.callToAction3
          }
          callToAction4={
            page.services.locations.tlaquepaque.services.socialNetworkManagement
              .priceSection.callToAction4
          }
          lang={lang}
        />

        <CallToActionSection
          imageUrl={
            page.services.locations.tlaquepaque.services.socialNetworkManagement
              .callToActionSection.imageUrl
          }
          topic={
            page.services.locations.tlaquepaque.services.socialNetworkManagement
              .callToActionSection.topic
          }
          title={
            page.services.locations.tlaquepaque.services.socialNetworkManagement
              .callToActionSection.title
          }
          description={
            page.services.locations.tlaquepaque.services.socialNetworkManagement
              .callToActionSection.description
          }
          callToAction={
            page.services.locations.tlaquepaque.services.socialNetworkManagement
              .callToActionSection.callToAction
          }
          lang={lang}
        />
      </main>
    </>
  );
};

export default SocialMediaManagementPage;
