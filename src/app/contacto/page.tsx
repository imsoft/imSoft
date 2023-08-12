import { Metadata } from "next";
import ContactInfo from "@/components/ui/shared/ContactInfo";
import SocialMediaBar from "@/components/ui/shared/SocialMediaBar";
import { ContactForm } from "@/components/ui/services";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "¿Necesitas contactarnos para resolver una duda, solicitar información o contratar nuestros servicios? ¡No dudes en hacerlo! En nuestro sitio web encontrarás un formulario de contacto diseñado específicamente para que puedas comunicarte con nosotros de manera sencilla y eficaz",
  keywords: ["imSoft", "Contacto"],
  twitter: {
    title: "Contacto",
    description:
      "¿Necesitas contactarnos para resolver una duda, solicitar información o contratar nuestros servicios? ¡No dudes en hacerlo! En nuestro sitio web encontrarás un formulario de contacto diseñado específicamente para que puedas comunicarte con nosotros de manera sencilla y eficaz",
  },
  openGraph: {
    title: "Contacto",
    description:
      "¿Necesitas contactarnos para resolver una duda, solicitar información o contratar nuestros servicios? ¡No dudes en hacerlo! En nuestro sitio web encontrarás un formulario de contacto diseñado específicamente para que puedas comunicarte con nosotros de manera sencilla y eficaz",
  },
};

const ContactPage = () => {
  return (
    <>
      <main>
        <div className="relative bg-white">
          <div className="absolute inset-0">
            <div className="absolute inset-y-0 left-0 w-1/2 bg-primary-500" />
          </div>
          <div className="relative mx-auto max-w-7xl lg:grid lg:grid-cols-5">
            <div className="bg-primary-500 py-16 px-6 lg:col-span-2 lg:px-8 lg:py-24 xl:pr-12">
              <div className="mx-auto max-w-lg">
                <h2 className="text-2xl font-bold tracking-tight text-gray-200 sm:text-3xl">
                  ¡Contáctanos!
                </h2>
                <p className="mt-3 text-lg leading-6 text-gray-100">
                  Nuestro equipo de expertos está comprometido con entender tus
                  necesidades y ayudarte a tener éxito a través de soluciones de
                  software eficientes. ¡Contáctanos para obtener más
                  información!
                </p>
                <ContactInfo textStyle={"text-gray-100"} />
                <SocialMediaBar
                  iconStyle={"text-gray-100 hover:text-gray-300"}
                />
              </div>
            </div>
            <div className="bg-white py-16 px-6 lg:col-span-3 lg:py-24 lg:px-8 xl:pl-12">
              <div className="mx-auto max-w-lg lg:max-w-none">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ContactPage;
