"use client";

import { motion } from "motion/react";

type Testimonial = {
  name: string;
  role: string | null;
  quote: string;
};

const testimonials: Testimonial[] = [
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
      "Julio, is a young vibrant individual who enjoys his work. Great communication, punctual and eager to learn.",
  },
  {
    name: "Daniel",
    role: null,
    quote:
      "Julio was very polite and professional. He asked great qualifying questions and we were able to dial in on the analysis that suited the project best. I would recommend his services and look forward to working with him in the future.",
  },
];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="rounded-3xl border border-text-muted/20 bg-surface-alt p-10 max-w-xs shadow-lg shadow-primary/10 flex flex-col gap-4">
      <p className="text-text font-body leading-relaxed italic">
        &ldquo;{testimonial.quote}&rdquo;
      </p>
      <div>
        <p className="font-display font-semibold text-text text-sm">
          {testimonial.name}
        </p>
        {testimonial.role !== null && (
          <p className="text-text-muted text-xs mt-0.5">{testimonial.role}</p>
        )}
      </div>
    </div>
  );
}

function TestimonialsColumn({
  testimonials,
  duration,
}: {
  testimonials: Testimonial[];
  duration: number;
}) {
  return (
    <div
      className="overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]"
      style={{ maxHeight: "740px" }}
    >
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{ duration, repeat: Infinity, ease: "linear", repeatType: "loop" }}
        className="flex flex-col gap-6"
      >
        {/* Render twice for seamless loop */}
        {[...testimonials, ...testimonials].map((t, i) => (
          <TestimonialCard key={`${t.name}-${i}`} testimonial={t} />
        ))}
      </motion.div>
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-24 px-6 bg-surface overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full border border-text-muted/30 text-text-muted font-body text-sm">
            Testimonials
          </span>
          <h2 className="font-display text-3xl md:text-4xl text-text font-bold mb-4">
            What Our Clients Say
          </h2>
          <p className="text-text-muted font-body text-lg">
            Real results from real partnerships.
          </p>
        </motion.div>

        <div className="flex gap-6 justify-center items-start">
          {/* Column 1 — always visible */}
          <div className="flex-1 flex flex-col items-center">
            <TestimonialsColumn
              testimonials={[testimonials[0]]}
              duration={15}
            />
          </div>

          {/* Column 2 — visible on md+ */}
          <div className="hidden md:flex flex-1 flex-col items-center">
            <TestimonialsColumn
              testimonials={[testimonials[1]]}
              duration={19}
            />
          </div>

          {/* Column 3 — visible on lg+ */}
          <div className="hidden lg:flex flex-1 flex-col items-center">
            <TestimonialsColumn
              testimonials={[testimonials[2]]}
              duration={17}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
