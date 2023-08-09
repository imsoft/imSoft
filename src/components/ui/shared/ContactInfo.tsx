import React from "react";
import Link from "next/link";

import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";

interface Props {
  textStyle: string;
}

const ContactInfo = ({ textStyle }: Props) => {
  return (
    <>
      <dl className={`mt-8 text-base ${textStyle}`}>
        <div>
          <dt className="sr-only">Ubicación</dt>
          <dd>
            <p>Guadalajara, Jalisco</p>
            <p>México</p>
          </dd>
        </div>
        <div className="mt-6">
          <dt className="sr-only">Número telefonico</dt>
          <dd className="flex">
            <PhoneIcon
              className={`h-6 w-6 flex-shrink-0 ${textStyle}`}
              aria-hidden="true"
            />
            <Link href={"tel:+523325365558"}>
              <span className="ml-3">33 2536 5558</span>
            </Link>
          </dd>
        </div>
        <div className="mt-3">
          <dt className="sr-only">Correo Electrónico</dt>
          <dd className="flex">
            <EnvelopeIcon
              className={`h-6 w-6 flex-shrink-0 ${textStyle}`}
              aria-hidden="true"
            />
            <Link
              href={
                "mailto:weareimsoft@gmail.com?Subject=¡Hola%20imSoft!%20💻,%20vengo%20de%20tu%20sitio%20web%20y%20me%20interesa%20conocer%20más%20se%20sus%20servicios%20😄"
              }
            >
              <span className="ml-3">contacto@imsoft.io</span>
            </Link>
          </dd>
        </div>
      </dl>
    </>
  );
};

export default ContactInfo;
