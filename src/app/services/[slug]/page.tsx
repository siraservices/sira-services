import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import {
  BOOKING_URL,
  DEFAULT_OG_IMAGE,
  breadcrumbJsonLd,
  serviceJsonLd,
} from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { getService, services } from "@/lib/services";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const service = getService(params.slug);
  const path = `/services/${params.slug}`;

  if (!service) {
    return {
      title: "Service Not Found",
      description: "The service you are looking for does not exist.",
      alternates: { canonical: path },
    };
  }

  const title = service.title;
  const description = service.metaDescription;

  return {
    title,
    description,
    keywords: service.keywords,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "SIRA",
      type: "website",
      locale: "en_US",
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  };
}

export default function ServiceDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const service = getService(params.slug);

  if (!service) {
    notFound();
  }

  const Icon = service.icon;
  const path = `/services/${service.slug}`;

  return (
    <div className="pt-32 pb-16 px-4 bg-surface">
      <JsonLd
        data={serviceJsonLd({
          name: service.title,
          description: service.metaDescription,
          path,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: service.title, path },
        ])}
      />
      <div className="max-w-3xl mx-auto">
        <Link
          href="/services"
          className="inline-flex items-center text-text-muted hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          All Services
        </Link>

        <header className="mb-12">
          <Icon className="h-12 w-12 text-primary mb-4" />
          <h1 className="text-4xl font-bold text-text mb-4">{service.title}</h1>
          <p className="text-xl text-text-muted">{service.intro}</p>
        </header>

        <div className="space-y-12">
          {service.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl font-bold text-text mb-4">
                {section.heading}
              </h2>
              {section.body.map((paragraph, i) => (
                <p key={i} className="text-text-body mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>

        <section className="mt-12 pt-10 border-t border-surface-border">
          <h2 className="text-2xl font-bold text-text mb-6">What&apos;s Included</h2>
          <ul className="space-y-3">
            {service.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-text-body">{feature}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-16 pt-10 border-t border-surface-border text-center">
          <p className="font-display font-semibold text-xl text-text mb-2">
            Scoping a {service.title.toLowerCase()} project?
          </p>
          <p className="text-text-muted mb-6">
            A free 30-minute call is the fastest way to see if it&apos;s a fit.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center h-12 px-7 bg-cta text-cta-text font-display font-semibold rounded-full hover:bg-charcoal transition-colors"
            >
              Book a free call
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center h-12 px-7 border border-text/25 text-text font-display font-semibold rounded-full hover:border-text/60 transition-colors"
            >
              Send a message
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
