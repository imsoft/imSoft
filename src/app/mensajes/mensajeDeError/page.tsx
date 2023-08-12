import { Metadata } from "next";
import MessageComponent from "@/components/ui/shared/MessageComponent";
import { INotificationMessage } from "@/interfaces";

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

const notificationMessageInfo: INotificationMessage = {
  topic: "Hubo un error al enviar un mensaje",
  message: "Perdón por las molestias",
  comment: "Te recomendamos volver a mandar el mensaje",
};

const MensajeDeError = () => {
  return (
    <>
      <main>
        <MessageComponent
          topic={notificationMessageInfo.topic}
          message={notificationMessageInfo.message}
          comment={notificationMessageInfo.comment}
        />
      </main>
    </>
  );
};

export default MensajeDeError;
