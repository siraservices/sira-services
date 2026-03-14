import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="py-16 px-4 bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">About</h1>

        <div className="prose max-w-none">
          <p className="text-xl text-gray-400 mb-8">
            I&apos;m a mechanical engineer turned AI practitioner, bringing a unique
            perspective to machine learning and computer vision projects.
          </p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">Background</h2>
          <p className="text-gray-300 mb-4">
            With a foundation in mechanical engineering and experience in
            healthcare HVAC systems, I developed a systematic approach to
            problem-solving that translates directly to AI/ML development. My
            engineering background means I think in terms of systems,
            constraints, and practical implementation—not just algorithms.
          </p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">What I Bring</h2>
          <p className="text-gray-300 mb-4">
            The intersection of traditional engineering and modern AI creates
            opportunities that pure software backgrounds often miss. I understand
            physical systems, sensors, manufacturing processes, and operational
            constraints—context that matters when building ML solutions for
            real-world applications.
          </p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">Technical Focus</h2>
          <p className="text-gray-300 mb-4">
            My work spans machine learning model development, computer vision
            systems, and AI-powered automation. Recent projects include
            classification models for video analysis, automated document
            processing systems, and predictive maintenance applications.
          </p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">Approach</h2>
          <p className="text-gray-300 mb-4">
            I believe in building AI solutions that actually ship. That means
            starting with clear business objectives, validating approaches
            quickly, and delivering systems that work reliably in production—not
            just in notebooks.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <h3 className="text-xl font-semibold text-white mb-4">Ready to work together?</h3>
          <Link
            href="/contact"
            className="inline-flex items-center text-amber-500 font-medium hover:text-amber-400"
          >
            Get in touch
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
