import Link from "next/link";
import {
  Brain,
  Eye,
  Cog,
  BarChart3,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const services = [
  {
    icon: Brain,
    title: "Machine Learning Development",
    description:
      "Custom ML models designed for your specific business challenges. From data analysis to production deployment.",
    features: [
      "Predictive analytics and forecasting",
      "Classification and regression models",
      "Recommendation systems",
      "Natural language processing",
      "Model optimization and tuning",
    ],
  },
  {
    icon: Eye,
    title: "Computer Vision Solutions",
    description:
      "Visual AI systems that see, understand, and analyze images and video for automation and insights.",
    features: [
      "Object detection and tracking",
      "Image classification",
      "Visual quality inspection",
      "Document and receipt processing",
      "Video analytics",
    ],
  },
  {
    icon: Cog,
    title: "AI Process Automation",
    description:
      "Intelligent automation that reduces manual work, improves accuracy, and scales your operations.",
    features: [
      "Workflow automation",
      "Intelligent document processing",
      "Data extraction and validation",
      "Automated reporting",
      "Integration with existing systems",
    ],
  },
  {
    icon: BarChart3,
    title: "Data Strategy & Consulting",
    description:
      "Strategic guidance on leveraging AI/ML for competitive advantage, from roadmap to implementation.",
    features: [
      "AI readiness assessment",
      "Use case identification",
      "Technology stack recommendations",
      "Implementation roadmaps",
      "Team training and knowledge transfer",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Services</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            End-to-end AI and machine learning solutions tailored to your
            business needs. From strategy to deployment.
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
                <h2 className="text-2xl font-bold text-gray-100 mb-4">{service.title}</h2>
                <p className="text-gray-400 mb-6">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className={`bg-gradient-to-br from-surface to-surface-light rounded-2xl h-64 flex items-center justify-center border border-[#333] ${
                  index % 2 === 1 ? "md:order-1" : ""
                }`}
              >
                <service.icon className="h-24 w-24 text-primary/30" />
              </div>
            </div>
          ))}
        </div>

        {/* Process Section */}
        <div className="mt-20 pt-16 border-t border-[#333]">
          <h2 className="text-3xl font-bold text-center text-gray-100 mb-12">How I Work</h2>
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
                <div className="text-4xl font-bold text-primary/30 mb-2">
                  {phase.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">{phase.title}</h3>
                <p className="text-sm text-gray-400">{phase.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-4 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
          >
            Start Your Project
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
