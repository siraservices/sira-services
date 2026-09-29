/**
 * Renders a JSON-LD structured-data block. Server component — the script is
 * part of the initial HTML so crawlers see it without running JavaScript.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // `<` is escaped so user-authored strings can't close the script tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
