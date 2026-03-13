import { cn } from "@/lib/utils";

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

export function TestimonialsSection() {
  return (
    <section className={cn("py-24 px-6 bg-surface")}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl text-text font-bold mb-4">
            What Our Clients Say
          </h2>
          <p className="text-text-muted font-body text-lg">
            Real results from real partnerships.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map(({ name, role, quote }) => (
            <div
              key={name}
              className="p-6 rounded-xl bg-surface-alt border border-text-muted/20 flex flex-col gap-4"
            >
              <p className="text-text-body leading-relaxed font-body italic">
                &ldquo;{quote}&rdquo;
              </p>
              <div>
                <p className="font-display font-semibold text-text text-sm">
                  {name}
                </p>
                {role !== null && (
                  <p className="text-text-muted text-xs mt-0.5">{role}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
