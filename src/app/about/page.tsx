import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BOOKING_URL, FOUNDER_NAME, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About: Engineer-Led AI & Computer Vision Studio",
  description:
    "SIRA is led by Julio Aira, a mechanical engineer turned AI practitioner, building machine learning and computer vision systems grounded in real-world constraints.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="pt-32 pb-16 px-4 bg-surface">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-text mb-8">About SIRA</h1>

        <div className="prose max-w-none">
          <p className="text-xl text-text-muted mb-8">
            I&apos;m {FOUNDER_NAME}, the engineer behind SIRA: a mechanical engineer
            turned AI practitioner, bringing a systems view to machine learning
            and computer vision projects.
          </p>

          <h2 className="text-2xl font-bold text-text mt-12 mb-4">Background</h2>
          <p className="text-text-body mb-4">
            With a foundation in mechanical engineering and experience in
            healthcare HVAC systems, I developed a systematic approach to
            problem-solving that translates directly to AI/ML development. My
            engineering background means I think in terms of systems,
            constraints, and practical implementation—not just algorithms.
          </p>

          <h2 className="text-2xl font-bold text-text mt-12 mb-4">What I Bring</h2>
          <p className="text-text-body mb-4">
            The intersection of traditional engineering and modern AI creates
            opportunities that pure software backgrounds often miss. I understand
            physical systems, sensors, manufacturing processes, and operational
            constraints—context that matters when building ML solutions for
            real-world applications.
          </p>

          <h2 className="text-2xl font-bold text-text mt-12 mb-4">Technical Focus</h2>
          <p className="text-text-body mb-4">
            My work spans machine learning model development, computer vision
            systems, and AI-powered automation. Recent projects include
            classification models for video analysis, automated document
            processing systems, and predictive maintenance applications.
          </p>

          <h2 className="text-2xl font-bold text-text mt-12 mb-4">Approach</h2>
          <p className="text-text-body mb-4">
            I believe in building AI solutions that actually ship. That means
            starting with clear business objectives, validating approaches
            quickly, and delivering systems that work reliably in production—not
            just in notebooks.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-surface-border">
          <h2 className="text-xl font-display font-semibold text-text mb-4">
            Have a project in mind?
          </h2>
          <div className="flex flex-wrap gap-3">
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
