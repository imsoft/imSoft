import { Metadata } from "next";
import MessageComponent from "@/components/ui/shared/MessageComponent";
import { Confetti } from "@/components/ui/shared";
import { Locale } from "../../../../../i18n.config";
import { getDictionary } from "@/lib/dictionary";

export const generateMetadata = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}): Promise<Metadata> => {
  const { metadata } = await getDictionary(lang);
  return {
    title: metadata.message.sent.title,
    description: metadata.message.sent.description,
    keywords: metadata.message.sent.keywords,
    twitter: {
      title: metadata.message.sent.twitter.title,
      description: metadata.message.sent.twitter.description,
    },
    openGraph: {
      title: metadata.message.sent.openGraph.title,
      description: metadata.message.sent.openGraph.description,
    },
  };
};

const ConfirmationMessagePage = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}) => {
  const { page } = await getDictionary(lang);
  return (
    <>
      <main>
        <Confetti />
        <MessageComponent
          topic={page.message.sent.topic}
          message={page.message.sent.message}
          comment={page.message.sent.comment}
        />
      </main>
    </>
  );
};

export default ConfirmationMessagePage;
