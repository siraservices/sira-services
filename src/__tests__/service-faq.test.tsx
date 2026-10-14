/**
 * Tests for the service-page FAQ:
 * - every service ships exactly five Q&As with answers in the 50–110 word range
 * - the FAQ section renders an H2 with one H3 per question
 * - the FAQPage JSON-LD mirrors the rendered questions and answers
 * - the service detail page has no heading-level skips (H1 → H2 → H3)
 */
import React from "react";
import { render, screen, within } from "@testing-library/react";
import { ServiceFaq, faqPageJsonLd } from "@/components/ServiceFaq";
import ServiceDetailPage from "@/app/services/[slug]/page";
import { services } from "@/lib/services";

jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

jest.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("notFound");
  },
}));

const wordCount = (s: string) => s.trim().split(/\s+/).length;

describe("service FAQ data", () => {
  it.each(services.map((s) => [s.slug, s]))("%s has five well-formed FAQs", (_slug, service) => {
    expect(service.faqs).toHaveLength(5);
    for (const faq of service.faqs) {
      expect(faq.question.trim().endsWith("?")).toBe(true);
      const words = wordCount(faq.answer);
      expect(words).toBeGreaterThanOrEqual(50);
      expect(words).toBeLessThanOrEqual(110);
    }
    const questions = new Set(service.faqs.map((f) => f.question));
    expect(questions.size).toBe(5);
  });
});

describe("<ServiceFaq />", () => {
  const service = services[0];

  it("renders an H2 and one H3 per question", () => {
    render(<ServiceFaq faqs={service.faqs} serviceTitle={service.title} />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Frequently asked questions" }),
    ).toBeInTheDocument();
    const h3s = screen.getAllByRole("heading", { level: 3 });
    expect(h3s.map((h) => h.textContent)).toEqual(service.faqs.map((f) => f.question));
    for (const faq of service.faqs) {
      expect(screen.getByText(faq.answer)).toBeInTheDocument();
    }
  });

  it("emits FAQPage JSON-LD that mirrors the rendered Q&As", () => {
    const { container } = render(
      <ServiceFaq faqs={service.faqs} serviceTitle={service.title} />,
    );
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const data = JSON.parse(script!.textContent ?? "");
    expect(data).toEqual(faqPageJsonLd(service.faqs));
    expect(data["@type"]).toBe("FAQPage");
    expect(data.mainEntity).toHaveLength(5);
    expect(data.mainEntity[0]).toEqual({
      "@type": "Question",
      name: service.faqs[0].question,
      acceptedAnswer: { "@type": "Answer", text: service.faqs[0].answer },
    });
  });
});

describe("service detail page heading outline", () => {
  it.each(services.map((s) => [s.slug]))("%s has no heading-level skips", (slug) => {
    const { container } = render(<ServiceDetailPage params={{ slug }} />);
    const headings = Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6"));
    const levels = headings.map((h) => Number(h.tagName[1]));

    expect(levels[0]).toBe(1);
    expect(levels.filter((l) => l === 1)).toHaveLength(1);
    for (let i = 1; i < levels.length; i++) {
      // A heading may go deeper by at most one level at a time.
      expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
    }

    const faq = within(container.querySelector('[aria-labelledby="service-faq-heading"]')!);
    expect(faq.getAllByRole("heading", { level: 3 })).toHaveLength(5);
    expect(
      container.querySelectorAll('script[type="application/ld+json"]').length,
    ).toBeGreaterThanOrEqual(3);
  });
});
