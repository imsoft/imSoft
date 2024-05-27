import { Metadata } from "next";
import MessageComponent from "@/components/ui/shared/MessageComponent";
import { Confetti } from "@/components/ui/shared";
import { Locale } from "../../../../../i18n.config";
import { getDictionary } from "@/lib/dictionary";

export const metadata: Metadata = {
  title: "Mensaje de confirmación",
  description: "Mensaje de confirmación, imSoft",
  keywords: ["imSoft", "Mensaje de confirmación"],
  twitter: {
    title: "Mensaje de confirmación",
    description: "Mensaje de confirmación, imSoft",
  },
  openGraph: {
    title: "Mensaje de confirmación",
    description: "Mensaje de confirmación, imSoft",
  },
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
