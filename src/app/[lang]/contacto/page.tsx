import { Metadata } from "next";
import ContactInfo from "@/components/ui/shared/ContactInfo";
import SocialMediaBar from "@/components/ui/shared/SocialMediaBar";
import { ContactForm } from "@/components/ui/services";
import { Locale } from "../../../../i18n.config";
import { getDictionary } from "@/lib/dictionary";

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

const ContactPage = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}) => {
  const { page } = await getDictionary(lang);
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
                  {page.contact.title}
                </h2>
                <p className="my-3 text-lg leading-6 text-gray-100">
                  {page.contact.description}
                </p>
                <ContactInfo textStyle={"text-gray-100"} lang={lang} />
                <SocialMediaBar
                  iconStyle={"text-gray-100 hover:text-gray-300"}
                />
              </div>
            </div>
            <div className="bg-white py-16 px-6 lg:col-span-3 lg:py-24 lg:px-8 xl:pl-12">
              <div className="mx-auto max-w-lg lg:max-w-none">
                <ContactForm
                  name={page.contact.form.name}
                  email={page.contact.form.email}
                  phone={page.contact.form.phone}
                  message={page.contact.form.message}
                  errorInputName={page.contact.form.errorInputName}
                  errorInputEmail={page.contact.form.errorInputEmail}
                  errorInputPhone={page.contact.form.errorInputPhone}
                  errorInputMessage={page.contact.form.errorInputMessage}
                  send={page.contact.form.send}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ContactPage;
