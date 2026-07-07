import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { services } from "@/lib/services";

export const metadata: Metadata = buildMetadata({
  title: "Services",
  description:
    "Machine learning development, computer vision, AI process automation, and multi-agent orchestration — end-to-end AI solutions built and deployed for your business.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <div className="py-16 px-4 bg-surface">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-text mb-4">Services</h1>
          <p className="text-xl text-text-muted max-w-2xl mx-auto">
            End-to-end AI and machine learning solutions tailored to your
            business needs. From integration to deployment.
          </p>
        </div>

        <div className="space-y-16">
          {services.map((service, index) => (
            <div
              key={service.title}
              className={`grid md:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              <div className={index % 2 === 1 ? "md:order-2" : ""}>
                <service.icon className="h-12 w-12 text-primary mb-4" />
                <h2 className="text-2xl font-bold text-text mb-4">{service.title}</h2>
                <p className="text-text-muted mb-6">{service.shortDescription}</p>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-text-body">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/services/${service.slug}`}
                  className="inline-flex items-center mt-6 text-primary font-semibold hover:text-primary-light transition-colors"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
              <div
                className={`bg-gradient-to-br from-surface-alt to-surface-hover rounded-2xl h-64 flex items-center justify-center ${
                  index % 2 === 1 ? "md:order-1" : ""
                }`}
              >
                <service.icon className="h-24 w-24 text-primary/30" />
              </div>
            </div>
          ))}
        </div>

        {/* Process Section */}
        <div className="mt-20 pt-16 border-t border-surface-border">
          <h2 className="text-3xl font-bold text-center text-text mb-12">How I Work</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Discovery",
                desc: "Understand your business, challenges, and goals",
              },
              {
                step: "02",
                title: "Strategy",
                desc: "Define the approach, timeline, and success metrics",
              },
              {
                step: "03",
                title: "Build",
                desc: "Develop, test, and iterate on the solution",
              },
              {
                step: "04",
                title: "Deploy",
                desc: "Launch, monitor, and optimize for results",
              },
            ].map((phase) => (
              <div key={phase.step} className="text-center">
                <div className="text-4xl font-bold text-primary/40 mb-2">
                  {phase.step}
                </div>
                <h3 className="text-lg font-semibold text-text mb-2">{phase.title}</h3>
                <p className="text-sm text-text-muted">{phase.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-4 bg-cta text-cta-text font-display font-semibold rounded-full hover:bg-primary-light transition-colors"
          >
            Start Your Project
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
