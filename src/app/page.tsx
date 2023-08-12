import { Metadata } from "next";
import {
  FirstSection,
  SecondSection,
  ThirdSection,
  FourthSection,
  FifthSection,
  SixthSection,
} from "@/components/ui/IndexPage";

export const metadata: Metadata = {
  title: "imSoft",
  description:
    "¿Necesitas contactarnos para resolver una duda, solicitar información o contratar nuestros servicios? ¡No dudes en hacerlo! En nuestro sitio web encontrarás un formulario de contacto diseñado específicamente para que puedas comunicarte con nosotros de manera sencilla y eficaz.",
  keywords: [
    "imSoft",
    "Portafolio de trabajo",
    "Clientes",
    "Clientes satisfechos",
    "Sitio web",
    "Aplicación web",
    "Ecommerce",
    "SEO",
    "Consultoria",
  ],
  twitter: {
    title: "imSoft",
    description:
      "¿Necesitas contactarnos para resolver una duda, solicitar información o contratar nuestros servicios? ¡No dudes en hacerlo! En nuestro sitio web encontrarás un formulario de contacto diseñado específicamente para que puedas comunicarte con nosotros de manera sencilla y eficaz.",
  },
  openGraph: {
    title: "imSoft",
    description:
      "¿Necesitas contactarnos para resolver una duda, solicitar información o contratar nuestros servicios? ¡No dudes en hacerlo! En nuestro sitio web encontrarás un formulario de contacto diseñado específicamente para que puedas comunicarte con nosotros de manera sencilla y eficaz.",
  },
};

const IndexPage = () => {
  return (
    <>
      <main>
        <FirstSection />
        <SecondSection />
        <ThirdSection />
        <FourthSection />
        <FifthSection />
        <SixthSection />
      </main>
    </>
  );
};

export default IndexPage;
