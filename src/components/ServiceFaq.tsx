import { Plus } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import type { ServiceFaq as ServiceFaqItem } from "@/lib/services";

/**
 * schema.org FAQPage block for a list of Q&As. Kept here (not in seo.ts) so the
 * FAQ markup and its structured data stay in one place.
 */
export function faqPageJsonLd(faqs: ServiceFaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Service-page FAQ: an accessible accordion built on native <details>/<summary>
 * (keyboard and screen-reader support for free, no client JS). Each question is
 * an H3 under the section's H2. Renders the matching FAQPage JSON-LD alongside.
 */
export function ServiceFaq({
  faqs,
  serviceTitle,
}: {
  faqs: ServiceFaqItem[];
  serviceTitle: string;
}) {
  if (!faqs.length) return null;

  return (
    <section aria-labelledby="service-faq-heading" className="mt-24 border-t border-divider pt-14">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <p className="eyebrow text-primary-dark">╱ FAQ</p>
          <h2
            id="service-faq-heading"
            className="mt-5 font-display text-3xl font-bold leading-[1.02] tracking-tighter text-ink text-balance sm:text-4xl"
          >
            Frequently asked questions
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            The questions buyers ask before a {serviceTitle.toLowerCase()} project starts:
            cost, timeline, what we need from you, and what happens after launch.
          </p>
        </div>

        <div className="lg:col-span-8">
          <div className="divide-y divide-divider rounded-3xl border border-divider bg-surface shadow-soft">
            {faqs.map((faq, i) => (
              <details key={faq.question} className="group" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 px-6 py-5 text-left [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset sm:px-8">
                  <h3 className="font-display text-base font-bold leading-snug text-ink transition-colors group-hover:text-primary-dark sm:text-lg">
                    {faq.question}
                  </h3>
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-divider text-primary-dark transition-transform duration-300 group-open:rotate-45 group-open:border-primary/40 group-open:bg-primary/10"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2.4} />
                  </span>
                </summary>
                <p className="px-6 pb-6 leading-relaxed text-text-body sm:px-8">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
