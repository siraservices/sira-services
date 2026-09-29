type Testimonial = {
  name: string;
  role: string | null;
  quote: string;
};

// Most relevant proof first: a measured AI result, then AI/analysis work,
// then general working-relationship feedback.
const featured: Testimonial = {
  name: "Lauren",
  role: "Elliott Tool Technologies",
  quote:
    "Sira did a great job on our project. They built and deployed an email classifier that stabilized around 92–93% accuracy, and throughout the process they were extremely communicative and collaborative with our team. They did a great job explaining technical decisions, trade-offs, testing results, and next steps in a way that was easy for non-technical stakeholders to follow, which made the entire build and stabilization period run much smoother. We learned a lot from working with them and I'd absolutely recommend them for similar projects.",
};

const testimonials: Testimonial[] = [
  {
    name: "Vladimir M.",
    role: "AI-Generated Image Detection",
    quote:
      "I hired them for a small project, and I couldn't be happier! Very professional approach, excellent.",
  },
  {
    name: "Daniel",
    role: null,
    quote:
      "Very polite and professional. Asked great qualifying questions and we were able to dial in on the analysis that suited the project best. I would recommend their services and look forward to working with them in the future.",
  },
  {
    name: "Jesse Batt",
    role: "Owner of Performance Meal Prep",
    quote:
      "Amazing experience! Super fast at addressing issues. Always making suggestions to better our site. Would 100% recommend",
  },
  {
    name: "Kerry Johnson",
    role: null,
    quote:
      "A young vibrant individual who enjoys their work. Great communication, punctual and eager to learn.",
  },
];

function Attribution({ t }: { t: Testimonial }) {
  return (
    <figcaption className="mt-5">
      <span className="block font-display text-sm font-semibold text-text">{t.name}</span>
      {t.role !== null && <span className="block text-xs text-text-muted">{t.role}</span>}
    </figcaption>
  );
}

export function TestimonialsSection() {
  return (
    <section className="bg-surface px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <h2 className="max-w-xl font-display text-3xl font-bold tracking-tight text-text md:text-4xl">
          What clients say after the project ships
        </h2>

        <figure className="mt-12 border-l-2 border-ink pl-6 md:pl-10">
          <blockquote className="max-w-3xl font-display text-xl font-semibold leading-snug tracking-tight text-text md:text-2xl">
            &ldquo;{featured.quote}&rdquo;
          </blockquote>
          <Attribution t={featured} />
        </figure>

        <div className="mt-16 grid grid-cols-1 gap-x-10 gap-y-10 border-t border-surface-border pt-10 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t) => (
            <figure key={t.name}>
              <blockquote className="text-[15px] leading-relaxed text-text-body">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <Attribution t={t} />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
