import { Metadata } from "next";
import MessageComponent from "@/components/ui/shared/MessageComponent";
import { INotificationMessage } from "@/interfaces";
import { Confetti } from "@/components/ui/shared";

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

const notificationMessageInfo: INotificationMessage = {
  topic: "Muchas gracias por tu mensaje",
  message: "¡Envío exitoso!",
  comment: "Te responderemos a la brevedad",
};

const ConfirmationMessagePage = () => {
  return (
    <>
      <main>
        <Confetti />
        <MessageComponent
          topic={notificationMessageInfo.topic}
          message={notificationMessageInfo.message}
          comment={notificationMessageInfo.comment}
        />
      </main>
    </>
  );
};

export default ConfirmationMessagePage;
