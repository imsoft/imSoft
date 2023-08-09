'use client';

import MessageComponent from "@/components/ui/shared/MessageComponent";
import { dateMetatagInfo } from "@/data";
import { INotificationMessage, RequiredMetatags } from "@/interfaces";
import { showConfetti } from "@/utils";
import { useEffect } from "react";

const MensajeDeConfirmacion = () => {
  const notificationMessageInfo: INotificationMessage = {
    topic: "Muchas gracias por tu mensaje",
    message: "¡Envío exitoso!",
    comment: "Te responderemos a la brevedad",
  };

  const metatagsInfo: RequiredMetatags = {
    title: "Mensaje de confirmación | imSoft",
    description: "Mensaje de confirmación",
    keywords: "Mensaje de confirmación, imSoft",
    author: "Brandon Uriel García Ramos",
    subject: "Mensaje de confirmación",
    date: dateMetatagInfo,
    type: "Mensaje de confirmación",
    source: "https://www.imsoft.io/mensajes/mensajeDeConfirmacion",
    image: "https://firebasestorage.googleapis.com/v0/b/imsoft-website.appspot.com/o/Logos%20Empresa%2FLogotipo%20imSoft.png?alt=media&token=4b71448f-4047-402f-8b41-82a6c5e59ec",
    url: "https://www.imsoft.io/mensajes/mensajeDeConfirmacion",
    robots: "index,follow",
    _id: "",
    tags: []
  };

  useEffect(() => {
    showConfetti();
  }, []);

  return (
    <>
      {/* MetaEtiquetas Básicas */}
      <title>{metatagsInfo.title}</title>
      <meta name="title" content={metatagsInfo.title} />
      <meta httpEquiv="title" content={metatagsInfo.title} />
      <meta name="description" lang="es" content={metatagsInfo.description} />
      <meta name="keywords" lang="es" content={metatagsInfo.keywords} />
      <meta name="date" content={metatagsInfo.date} />

      {/* Informacion del autor */}
      <meta name="author" content={metatagsInfo.author} />

      {/* Dublincore */}
      <meta name="DC.title" lang="es-MX" content={metatagsInfo.title} />
      <meta name="DC.creator" lang="es-MX" content={metatagsInfo.author} />
      <meta name="DC.subject" lang="es-MX" content={metatagsInfo.subject} />
      <meta
        name="DC.description"
        lang="es-MX"
        content={metatagsInfo.description}
      />
      <meta name="DC.publisher" lang="es-MX" content={metatagsInfo.author} />
      <meta name="DC.date" lang="es-MX" content={metatagsInfo.date} />
      <meta name="DC.type" lang="es-MX" content={metatagsInfo.type} />
      <meta name="DC.identifier" lang="es-MX" content={metatagsInfo.title} />
      <meta name="DC.source" lang="es-MX" content={metatagsInfo.source} />
      <meta name="DC.relation" lang="es-MX" content={metatagsInfo.source} />

      {/* Twitter */}
      <meta name="twitter:title" content={metatagsInfo.title} />
      <meta name="twitter:description" content={metatagsInfo.description} />
      <meta name="twitter:image:src" content={metatagsInfo.image} />
      <meta name="twitter:image:alt" content={metatagsInfo.title} />

      {/* Facebook */}
      <meta property="og:title" content={metatagsInfo.title} />
      <meta property="og:type" content={metatagsInfo.type} />
      <meta
        property="og:url"
        content={`https://www.imsoft.io${metatagsInfo.url}`}
      />
      <meta property="og:image" content={metatagsInfo.image} />
      <meta property="og:description" content={metatagsInfo.description} />

      {/* Google + / Pinterest */}
      <meta itemProp="description" content={metatagsInfo.description} />
      <meta itemProp="image" content={metatagsInfo.image} />

      {/* Robots */}
      <meta name="robots" content={metatagsInfo.robots} />

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

export default MensajeDeConfirmacion;
