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

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: Testimonial;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="rounded-3xl border border-text-muted/20 bg-surface-alt p-10 shadow-lg shadow-primary/10 flex flex-col gap-4"
    >
      <p className="text-text font-body leading-relaxed italic flex-1">
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
    </motion.div>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
