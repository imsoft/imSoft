interface StructuredDataProps {
  data: object;
  id?: string;
}

/**
 * Inserta JSON-LD en el HTML renderizado en servidor.
 *
 * Antes usaba `next/script`, cuya estrategia por defecto (`afterInteractive`) inyecta
 * la etiqueta despues de hidratar: el schema no aparecia en el HTML servido y ningun
 * rastreador lo veia en el primer pase. Un <script> normal si se serializa en el SSR,
 * que es lo que documenta Next para JSON-LD en el App Router.
 */
export function StructuredData({ data, id = 'structured-data' }: StructuredDataProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      // El contenido es JSON generado por nosotros, nunca entrada de usuario sin escapar.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
