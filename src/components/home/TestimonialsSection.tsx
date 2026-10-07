import { Quote } from "lucide-react";
import { Reveal } from "@/components/ui/motion";
import { SectionHeading } from "@/components/ui/section-heading";

type Testimonial = {
  name: string;
  role: string | null;
  quote: string;
};

// Real client feedback, quoted as given. Most relevant proof first: a measured
// AI result, then AI/analysis work, then website and working-relationship feedback.
const featured: Testimonial = {
  name: "Lauren",
  role: "Elliott Tool Technologies",
  quote:
    "Sira did a great job on our project. They built and deployed an email classifier that stabilized around 92–93% accuracy, and throughout the process they were extremely communicative and collaborative with our team. They did a great job explaining technical decisions, trade-offs, testing results, and next steps in a way that was easy for non-technical stakeholders to follow, which made the entire build and stabilization period run much smoother. We learned a lot from working with them and I'd absolutely recommend them for similar projects.",
};

const testimonials: Testimonial[] = [
  {
    name: "Vladimir M.",
    role: "AI-generated image detection",
    quote:
      "I hired them for a small project, and I couldn't be happier! Very professional approach, excellent.",
  },
  {
    name: "Jesse Batt",
    role: "Owner, Performance Meal Prep",
    quote:
      "Amazing experience! Super fast at addressing issues. Always making suggestions to better our site. Would 100% recommend",
  },
  {
    name: "Daniel",
    role: null,
    quote:
      "Very polite and professional. Asked great qualifying questions and we were able to dial in on the analysis that suited the project best. I would recommend their services and look forward to working with them in the future.",
  },
  {
    name: "Kerry Johnson",
    role: null,
    quote:
      "A young vibrant individual who enjoys their work. Great communication, punctual and eager to learn.",
  },
];

function Attribution({ t, dark = false }: { t: Testimonial; dark?: boolean }) {
  return (
    <figcaption className="mt-5 flex items-center gap-3">
      <span className={`flex h-9 w-9 items-center justify-center rounded-full font-display text-sm font-bold ${dark ? "bg-white/15 text-white" : "bg-primary/10 text-primary-dark"}`}>
        {t.name.charAt(0)}
      </span>
      <span>
        <span className={`block font-display text-sm font-semibold ${dark ? "text-white" : "text-ink"}`}>{t.name}</span>
        {t.role !== null && <span className={`block text-xs ${dark ? "text-white/60" : "text-muted"}`}>{t.role}</span>}
      </span>
    </figcaption>
  );
}

export function TestimonialsSection() {
  return (
    <section className="px-6 py-24 sm:px-10 sm:py-32 lg:px-16 lg:py-40">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading
            eyebrow="Client feedback"
            title="What clients say"
            flourish="after the project ships."
          />
        </Reveal>

        <Reveal className="mt-14 grid gap-6 lg:grid-cols-5" stagger={0.1}>
          {/* Featured quote */}
          <figure
            data-reveal
            className="relative overflow-hidden rounded-4xl bg-primary p-8 text-white shadow-cta-glow sm:p-10 lg:col-span-3"
          >
            <div aria-hidden="true" className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
            <Quote className="h-8 w-8 text-white/40" strokeWidth={1.8} />
            <blockquote className="mt-5 font-display text-lg font-semibold leading-snug tracking-tight sm:text-xl lg:text-2xl">
              &ldquo;{featured.quote}&rdquo;
            </blockquote>
            <Attribution t={featured} dark />
          </figure>

          {/* Smaller cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-1">
            {testimonials.slice(0, 2).map((t) => (
              <figure
                key={t.name}
                data-reveal
                className="lift-on-hover rounded-3xl border border-divider bg-surface p-6 shadow-soft transition-shadow hover:shadow-card sm:p-7"
              >
                <blockquote className="text-sm leading-relaxed text-text-body sm:text-[15px]">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <Attribution t={t} />
              </figure>
            ))}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-5">
            {testimonials.slice(2).map((t) => (
              <figure
                key={t.name}
                data-reveal
                className="lift-on-hover rounded-3xl border border-divider bg-surface p-6 shadow-soft transition-shadow hover:shadow-card sm:p-7"
              >
                <blockquote className="text-sm leading-relaxed text-text-body sm:text-[15px]">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <Attribution t={t} />
              </figure>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
