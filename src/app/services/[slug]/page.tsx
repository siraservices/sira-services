import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";
import {
  BOOKING_URL,
  SITE_URL,
  breadcrumbJsonLd,
  serviceJsonLd,
} from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { getService, services } from "@/lib/services";
import { btn } from "@/components/ui/section-heading";

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
      images: [
        { url: `${SITE_URL}${service.image}`, width: 1600, height: 1000, alt: service.imageAlt },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_URL}${service.image}`],
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

  const related = services.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <div className="pb-24 pt-36 sm:pt-40">
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
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <Link href="/services" className="group inline-flex items-center gap-2 font-display text-sm text-muted transition-colors hover:text-primary-dark">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          All services
        </Link>

        <header className="mt-8 grid items-end gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow flex items-center gap-2 text-primary-dark">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-4 w-4" strokeWidth={2.4} />
              </span>
              {service.eyebrow}
            </p>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1] tracking-tighter text-ink sm:text-5xl lg:text-6xl">
              {service.title}
            </h1>
            <p className="mt-6 font-serif text-2xl italic leading-snug text-primary-dark sm:text-3xl">
              {service.shortDescription}
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={service.image}
            alt={service.imageAlt}
            className="aspect-[16/10] w-full rounded-4xl border border-divider object-cover shadow-card"
          />
        </header>

        <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-8">
            <p className="text-lg leading-relaxed text-text-body sm:text-xl">{service.intro}</p>
            <div className="mt-12 space-y-12">
              {service.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                    {section.heading}
                  </h2>
                  {section.body.map((paragraph, i) => (
                    <p key={i} className="mt-4 leading-relaxed text-text-body">
                      {paragraph}
                    </p>
                  ))}
                </section>
              ))}
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <section className="rounded-3xl border border-divider bg-surface p-6 shadow-soft">
                <p className="eyebrow text-primary-dark">╱ What&apos;s included</p>
                <ul className="mt-4 space-y-3">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-text-body">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.4} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </section>
              <section className="rounded-3xl bg-deep p-6 text-white">
                <p className="font-display text-lg font-bold tracking-tight">
                  Scoping a {service.title.toLowerCase()} project?
                </p>
                <p className="mt-2 text-sm text-white/65">
                  A free 30-minute call is the fastest way to see if it&apos;s a fit.
                </p>
                <div className="mt-5 flex flex-col gap-2">
                  <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className={btn.primary}>
                    Book a free call
                    <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} />
                  </a>
                  <Link href="/contact" className={btn.secondaryDark}>
                    Send a message
                    <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
                  </Link>
                </div>
              </section>
            </div>
          </aside>
        </div>

        {/* Related services */}
        <section className="mt-24 border-t border-divider pt-14">
          <p className="eyebrow text-primary-dark">╱ Other services</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/services/${r.slug}`}
                className="lift-on-hover group rounded-3xl border border-divider bg-surface p-5 shadow-soft transition-shadow hover:shadow-card"
              >
                <r.icon className="h-5 w-5 text-primary-dark" strokeWidth={2.2} />
                <p className="mt-3 font-display text-base font-bold text-ink group-hover:text-primary-dark">{r.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted">{r.shortDescription}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
