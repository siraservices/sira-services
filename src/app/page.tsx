import Link from "next/link";
import { ArrowRight, Brain, Eye, Cog, BarChart3 } from "lucide-react";

const services = [
  {
    icon: Brain,
    title: "Machine Learning",
    description:
      "Custom ML models tailored to your business needs. From predictive analytics to recommendation systems.",
  },
  {
    icon: Eye,
    title: "Computer Vision",
    description:
      "Image recognition, object detection, and visual inspection systems that automate and enhance your operations.",
  },
  {
    icon: Cog,
    title: "AI Automation",
    description:
      "Streamline workflows with intelligent automation. Reduce manual work and increase accuracy.",
  },
  {
    icon: BarChart3,
    title: "Data Strategy",
    description:
      "Turn your data into a competitive advantage with strategic ML implementation roadmaps.",
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Transform Your Business with
            <span className="text-blue-600"> Intelligent AI Solutions</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Custom machine learning, computer vision, and AI automation services
            that turn your data into actionable intelligence and measurable results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start a Project
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              View Services
            </Link>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What I Do</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <div
                key={service.title}
                className="p-6 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <service.icon className="h-10 w-10 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-300 mb-8">
            Let&apos;s discuss how AI can solve your specific business challenges.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Schedule a Consultation
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
