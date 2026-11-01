interface StructuredDataProps {
  data: object;
  id?: string;
}

/**
 * Inserts JSON-LD into the server-rendered HTML.
 *
 * It used to use `next/script`, whose default strategy (`afterInteractive`) injects
 * the tag after hydration: the schema wasn't in the served HTML and no crawler
 * saw it on the first pass. A plain <script> does get serialized in SSR, which is
 * what Next documents for JSON-LD in the App Router.
 */
export function StructuredData({ data, id = 'structured-data' }: StructuredDataProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      // The content is JSON we generate, never unescaped user input.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
