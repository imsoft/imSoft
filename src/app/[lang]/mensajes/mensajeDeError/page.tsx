import { Metadata } from "next";
import MessageComponent from "@/components/ui/shared/MessageComponent";
import { Locale } from "../../../../../i18n.config";
import { getDictionary } from "@/lib/dictionary";

export const metadata: Metadata = {
  title: "Mensaje de error",
  description: "Mensaje de error, imSoft",
  keywords: ["imSoft", "Mensaje de error"],
  twitter: {
    title: "Mensaje de error",
    description: "Mensaje de error, imSoft",
  },
  openGraph: {
    title: "Mensaje de error",
    description: "Mensaje de error, imSoft",
  },
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
