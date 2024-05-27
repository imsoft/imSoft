import { Metadata } from "next";
import { Locale } from "../../../../i18n.config";
import { getDictionary } from "@/lib/dictionary";

export const metadata: Metadata = {
  title: "Aviso de privacidad",
  description:
    "imSoft se preocupa por la privacidad de sus clientes y usuarios, por lo que proteger la información personal es una prioridad para nosotros. Este aviso de privacidad explica cómo recopilamos, usamos y protegemos la información personal que se nos proporciona a través de nuestros productos, servicios, sitios web y aplicaciones móviles",
  keywords: ["imSoft", "Aviso de privacidad"],
  twitter: {
    title: "Aviso de privacidad",
    description:
      "imSoft se preocupa por la privacidad de sus clientes y usuarios, por lo que proteger la información personal es una prioridad para nosotros. Este aviso de privacidad explica cómo recopilamos, usamos y protegemos la información personal que se nos proporciona a través de nuestros productos, servicios, sitios web y aplicaciones móviles",
  },
  openGraph: {
    title: "Aviso de privacidad",
    description:
      "imSoft se preocupa por la privacidad de sus clientes y usuarios, por lo que proteger la información personal es una prioridad para nosotros. Este aviso de privacidad explica cómo recopilamos, usamos y protegemos la información personal que se nos proporciona a través de nuestros productos, servicios, sitios web y aplicaciones móviles",
  },
};

const PrivacyNoticePage = async ({
  params: { lang },
}: {
  params: { lang: Locale };
}) => {
  const { page } = await getDictionary(lang);
  return (
    <>
      <main>
        <div className="relative overflow-hidden bg-white py-16">
          <div className="relative px-6 lg:px-8">
            <div className="mx-auto max-w-prose text-lg">
              <h1>
                <span className="block text-center text-lg font-semibold text-primary-600">
                  imSoft
                </span>
                <span className="mt-2 block text-center text-3xl font-bold leading-8 tracking-tight text-gray-900 sm:text-4xl">
                  {page.privacyNotice.title}
                </span>
              </h1>
            </div>
            <div className="prose prose-lg prose-indigo max-w-screen-lg mx-auto mt-6 text-gray-500">
              <p>{page.privacyNotice.firstParagraph}</p>
              <h2>
                <strong>{page.privacyNotice.firstQuestion}</strong>
              </h2>
              <p>{page.privacyNotice.firstAnswer1}</p>
              <p>{page.privacyNotice.firstAnswer2}</p>
              <h2>
                <strong>{page.privacyNotice.secondQuestion}</strong>
              </h2>
              <p>{page.privacyNotice.secondAnswer1}</p>
              <p>{page.privacyNotice.secondAnswer2}</p>
              <h2>
                <strong>{page.privacyNotice.thirdQuestion}</strong>
              </h2>
              <p>{page.privacyNotice.thirdAnswer1}</p>
              <p>{page.privacyNotice.thirdAnswer2}</p>
              <ul role="list" className="list-disc">
                {page.privacyNotice.thirdAnswer3.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p>{page.privacyNotice.thirdAnswer4}</p>
              <h2>
                <strong>{page.privacyNotice.fourthQuestion}</strong>
              </h2>
              <p>{page.privacyNotice.fourthAnswer}</p>

              <h2>
                <strong>{page.privacyNotice.fifthQuestion}</strong>
              </h2>
              <p>contacto@imsoft.io</p>
              <h2>
                <strong>{page.privacyNotice.sixthQuestion}</strong>
              </h2>
              <p>{page.privacyNotice.sixthAnswer1}</p>
              <p>{page.privacyNotice.sixthAnswer2}</p>
              <p>{page.privacyNotice.sixthAnswer3}</p>
              <h2>
                <strong>{page.privacyNotice.seventhQuestion}</strong>
              </h2>
              <p>{page.privacyNotice.seventhAnswer}</p>
              <p>{page.privacyNotice.lastUpdate}</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default PrivacyNoticePage;
