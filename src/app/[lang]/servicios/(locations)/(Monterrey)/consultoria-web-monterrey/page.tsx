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
  EyeIcon,
  DocumentTextIcon,
  DocumentChartBarIcon,
  PresentationChartLineIcon,
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { Locale } from "../../../../../../../i18n.config";
import { getDictionary } from "@/lib/dictionary";

export const metadata: Metadata = {
  title: "Consultoría Web en Monterrey | imSoft",
  description:
    "Expertos en consultoría web en Monterrey, ofreciendo soluciones personalizadas para el desarrollo de sitios y aplicaciones web. Nuestro equipo experto está listo para elevar la presencia online de tu negocio.",
  keywords: [
    "imSoft",
    "Consultoría web",
    "Consultoría web Monterrey",
    "Desarrollo web Monterrey",
  ],
  twitter: {
    title: "Consultoría Web en Monterrey por imSoft",
    description:
      "Descubre cómo nuestra consultoría web en Monterrey puede transformar tu negocio, optimizando tu sitio y aplicaciones web para el éxito.",
  },
  openGraph: {
    title: "Servicios de Consultoría Web en Monterrey | imSoft",
    description:
      "En imSoft, brindamos consultoría web especializada en Monterrey, asegurando que tu sitio web y aplicaciones estén alineados con tus objetivos empresariales.",
  },
};

const iconMapping: { [key: string]: HeroIcon } = {
  EyeIcon,
  DocumentTextIcon,
  DocumentChartBarIcon,
  PresentationChartLineIcon,
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
};

const ConsultancyPage = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}) => {
  const { page } = await getDictionary(lang);

  const serviceFeatures =
    page.services.locations.monterrey.services.webConsulting.featuresSection.serviceFeatures.map(
      (feature: { title: string; description: string; icon: string }) => ({
        ...feature,
        icon: iconMapping[feature.icon] as HeroIcon,
      })
    );
  return (
    <>
      <main>
        <IntroductorySection
          title={page.services.locations.monterrey.services.webConsulting
            .introductorySection.title}
          description={page.services.locations.monterrey.services.webConsulting
            .introductorySection.description}
          callToAction1={page.services.locations.monterrey.services.webConsulting
            .introductorySection.callToAction1}
          callToAction2={page.services.locations.monterrey.services.webConsulting
            .introductorySection.callToAction2}
          callToAction3={page.services.locations.monterrey.services.webConsulting
            .introductorySection.callToAction3} lang={lang}        />

        <FeaturesSection
          topic={
            page.services.locations.monterrey.services.webConsulting
              .featuresSection.topic
          }
          title={
            page.services.locations.monterrey.services.webConsulting
              .featuresSection.title
          }
          description={
            page.services.locations.monterrey.services.webConsulting
              .featuresSection.description
          }
          serviceFeatures={serviceFeatures}
        />

        <PriceSection
          topic={page.services.locations.monterrey.services.webConsulting
            .priceSection.topic}
          description={page.services.locations.monterrey.services.webConsulting
            .priceSection.description}
          listOfPackages={page.services.locations.monterrey.services.webConsulting
            .priceSection.listOfPackages}
          title={page.services.locations.monterrey.services.webConsulting
            .priceSection.title}
          whatIncludes={page.services.locations.monterrey.services.webConsulting
            .priceSection.whatIncludes}
          callToAction1={page.services.locations.monterrey.services.webConsulting
            .priceSection.callToAction1}
          callToAction2={page.services.locations.monterrey.services.webConsulting
            .priceSection.callToAction2}
          callToAction3={page.services.locations.monterrey.services.webConsulting
            .priceSection.callToAction3}
          callToAction4={page.services.locations.monterrey.services.webConsulting
            .priceSection.callToAction4} lang={lang}        />

        <CallToActionSection
          imageUrl={page.services.locations.monterrey.services.webConsulting
            .callToActionSection.imageUrl}
          topic={page.services.locations.monterrey.services.webConsulting
            .callToActionSection.topic}
          title={page.services.locations.monterrey.services.webConsulting
            .callToActionSection.title}
          description={page.services.locations.monterrey.services.webConsulting
            .callToActionSection.description}
          callToAction={page.services.locations.monterrey.services.webConsulting
            .callToActionSection.callToAction} lang={lang}        />
      </main>
    </>
  );
};

export default ConsultancyPage;
