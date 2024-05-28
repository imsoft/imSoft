import { Metadata } from "next";
import MessageComponent from "@/components/ui/shared/MessageComponent";
import { Locale } from "../../../../../i18n.config";
import { getDictionary } from "@/lib/dictionary";

export const generateMetadata = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}): Promise<Metadata> => {
  const { metadata } = await getDictionary(lang);
  return {
    title: metadata.message.error.title,
    description: metadata.message.error.description,
    keywords: metadata.message.error.keywords,
    twitter: {
      title: metadata.message.error.twitter.title,
      description: metadata.message.error.twitter.description,
    },
    openGraph: {
      title: metadata.message.error.openGraph.title,
      description: metadata.message.error.openGraph.description,
    },
  };
};

const MensajeDeError = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}) => {
  const { page } = await getDictionary(lang);
  return (
    <>
      <main>
        <MessageComponent
          topic={page.message.error.topic}
          message={page.message.error.message}
          comment={page.message.error.comment}
        />
      </main>
    </>
  );
};

export default MensajeDeError;
