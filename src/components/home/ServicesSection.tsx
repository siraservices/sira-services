import Link from "next/link";
import { Network, Database, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const services = [
  {
    icon: Network,
    title: "AI Integration & Agent Orchestration",
    description:
      "We design and deploy coordinated AI agent systems that automate complex workflows end-to-end. Think of it as a tireless digital workforce — purpose-built for lean teams that need enterprise-grade operational power without the headcount.",
  },
  {
    icon: Database,
    title: "Data Pipeline Implementation",
    description:
      "Turn raw, scattered data into reliable automated workflows. We design and build the data infrastructure your team needs to make confident decisions and power your AI initiatives at scale.",
  },
  {
    icon: Eye,
    title: "Custom Computer Vision Systems",
    description:
      "Automate visual inspection and analysis with precision. From defect detection to real-time monitoring, we build computer vision solutions that replace manual review and reduce costly errors.",
  },
];

export function ServicesSection() {
  return (
    <section className={cn("py-24 px-6")}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl text-text font-bold mb-4">
            What SIRA builds
          </h2>
          <p className="text-text-muted font-body text-lg max-w-2xl mx-auto">
            From a first prototype on your data to a system your team runs day
            to day.
          </p>
          <Link
            href="/services"
            className="mt-4 inline-block font-display text-sm font-semibold text-text underline underline-offset-4 hover:text-charcoal"
          >
            See all services
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {services.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group relative p-7 rounded-xl bg-surface border border-text-muted/20 shadow-card hover:shadow-elevated hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            >
              <div className="p-3 rounded-xl bg-primary/10 w-fit mb-5 group-hover:bg-primary transition-colors duration-200">
                <Icon className="h-6 w-6 text-primary group-hover:text-cta-text transition-colors duration-200" />
              </div>
              <h3 className="font-display font-semibold text-text text-lg mb-2">
                {title}
              </h3>
              <p className="text-sm text-text-body leading-relaxed font-body">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
