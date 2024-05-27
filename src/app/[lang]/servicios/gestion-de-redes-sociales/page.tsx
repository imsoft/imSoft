import {
  IntroductorySection,
  FeaturesSection,
  CallToActionSection,
  PriceSection,
} from "@/components/ui/services";
import {
  PhotoIcon,
  PresentationChartBarIcon,
  UsersIcon,
  EyeIcon,
  PresentationChartLineIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";
import { Metadata } from "next";
import { Locale } from "../../../../../i18n.config";
import type { HeroIcon } from "@/interfaces";
import { getDictionary } from "@/lib/dictionary";

export const metadata: Metadata = {
  title: "Gestión Profesional de Redes Sociales",
  description:
    "Nuestro servicio integral de gestión de redes sociales está diseñado para elevar tu presencia en línea, fortalecer la conexión con tu audiencia y potenciar el alcance de tu marca. Administramos tus perfiles sociales con contenido dinámico, interacciones significativas y estrategias de crecimiento adaptadas a las tendencias digitales actuales, asegurando que tu marca destaque en el ruidoso mundo de las redes sociales.",
  keywords: [
    "imSoft",
    "Gestión de Redes Sociales",
    "Marketing Digital",
    "Engagement Social",
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
    page.services.socialNetworkManagement.featuresSection.serviceFeatures.map(
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
            page.services.socialNetworkManagement.introductorySection.title
          }
          description={
            page.services.socialNetworkManagement.introductorySection
              .description
          }
          callToAction1={
            page.services.socialNetworkManagement.introductorySection
              .callToAction1
          }
          callToAction2={
            page.services.socialNetworkManagement.introductorySection
              .callToAction2
          }
          callToAction3={
            page.services.socialNetworkManagement.introductorySection
              .callToAction3
          }
          lang={lang}
        />

        <FeaturesSection
          topic={page.services.socialNetworkManagement.featuresSection.topic}
          title={page.services.socialNetworkManagement.featuresSection.title}
          description={
            page.services.socialNetworkManagement.featuresSection.description
          }
          serviceFeatures={serviceFeatures}
        />

        <PriceSection
          topic={page.services.socialNetworkManagement.priceSection.topic}
          description={
            page.services.socialNetworkManagement.priceSection.description
          }
          listOfPackages={
            page.services.socialNetworkManagement.priceSection.listOfPackages
          }
          title={page.services.socialNetworkManagement.priceSection.title}
          whatIncludes={
            page.services.socialNetworkManagement.priceSection.whatIncludes
          }
          callToAction1={
            page.services.socialNetworkManagement.priceSection.callToAction1
          }
          callToAction2={
            page.services.socialNetworkManagement.priceSection.callToAction2
          }
          callToAction3={
            page.services.socialNetworkManagement.priceSection.callToAction3
          }
          callToAction4={
            page.services.socialNetworkManagement.priceSection.callToAction4
          }
          lang={lang}
        />

        <CallToActionSection
          imageUrl={
            page.services.socialNetworkManagement.callToActionSection.imageUrl
          }
          topic={
            page.services.socialNetworkManagement.callToActionSection.topic
          }
          title={
            page.services.socialNetworkManagement.callToActionSection.title
          }
          description={
            page.services.socialNetworkManagement.callToActionSection
              .description
          }
          callToAction={
            page.services.socialNetworkManagement.callToActionSection
              .callToAction
          }
          lang={lang}
        />
      </main>
    </>
  );
};

export default SocialMediaManagementPage;
