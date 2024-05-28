import { Metadata } from "next";
import {
  FirstSection,
  SecondSection,
  ThirdSection,
  FourthSection,
  FifthSection,
  SixthSection,
} from "@/components/ui/IndexPage";
import { Locale } from "../../../i18n.config";
import { getDictionary } from "@/lib/dictionary";

export const generateMetadata = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}): Promise<Metadata> => {
  const { metadata } = await getDictionary(lang);
  return {
    title: metadata.home.title,
    description: metadata.home.description,
    keywords: metadata.home.keywords,
    twitter: {
      title: metadata.home.twitter.title,
      description: metadata.home.twitter.description,
    },
    openGraph: {
      title: metadata.home.openGraph.title,
      description: metadata.home.openGraph.description,
    },
  };
};

const IndexPage = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}) => {
  const { page } = await getDictionary(lang);

  return (
    <>
      <main>
        <FirstSection
          title={page.home.firstSection.title}
          description={page.home.firstSection.description}
          callToAction1={page.home.firstSection.callToAction1}
          callToAction2={page.home.firstSection.callToAction2}
          lang={lang}
        />
        <SecondSection
          title={page.home.secondSection.title}
          description={page.home.secondSection.description}
          text1={page.home.secondSection.text1}
          text2={page.home.secondSection.text2}
          text3={page.home.secondSection.text3}
        />
        <ThirdSection
          title1={page.home.thirdSection.title1}
          title2={page.home.thirdSection.title2}
          description={page.home.thirdSection.description}
          callToAction1={page.home.thirdSection.callToAction1}
          callToAction2={page.home.thirdSection.callToAction2}
          lang={lang}
        />
        <FourthSection
          title={page.home.fourthSection.title}
          description={page.home.fourthSection.description}
          infoServices={page.home.fourthSection.infoServices}
          lang={lang}
        />
        <FifthSection
          title={page.home.fifthSection.title}
          description={page.home.fifthSection.description}
          features={page.home.fifthSection.features}
          callToAction1={page.home.fifthSection.callToAction1}
          callToAction2={page.home.fifthSection.callToAction2}
          lang={lang}
        />
        <SixthSection
          title1={page.home.sixthSection.title1}
          title2={page.home.sixthSection.title2}
          description={page.home.sixthSection.description}
          callToAction={page.home.sixthSection.callToAction}
          lang={lang}
        />
      </main>
    </>
  );
};

export default IndexPage;
