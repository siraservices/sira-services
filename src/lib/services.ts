import { Brain, Eye, Cog, Network, type LucideIcon } from "lucide-react";

export interface ServiceSection {
  heading: string;
  body: string[];
}

export interface Service {
  slug: string;
  icon: LucideIcon;
  title: string;
  /** One-line summary used on the services listing cards. */
  shortDescription: string;
  /** SEO meta description for the detail page. */
  metaDescription: string;
  keywords: string[];
  /** Opening paragraph on the detail page. */
  intro: string;
  sections: ServiceSection[];
  features: string[];
}

export const services: Service[] = [
  {
    slug: "machine-learning-development",
    icon: Brain,
    title: "Machine Learning Development",
    shortDescription:
      "Custom ML models designed for your specific business challenges — from data analysis to production deployment.",
    metaDescription:
      "Custom machine learning development for business: predictive analytics, classification, recommendation systems, and NLP models built, tuned, and deployed to production.",
    keywords: [
      "machine learning development",
      "custom ML models",
      "predictive analytics",
      "model deployment",
      "machine learning consulting",
    ],
    intro:
      "Off-the-shelf AI solves general problems. Your hardest, most valuable problems are specific to your business — and those need models built on your data, for your goals. We design, train, and deploy custom machine learning models that turn your data into decisions, forecasts, and automation you can rely on in production.",
    sections: [
      {
        heading: "Models Built for Your Data, Not the Average Case",
        body: [
          "General-purpose AI is trained to be adequate at everything and exceptional at nothing in particular. When accuracy on your specific task drives real revenue or cost, that trade-off stops working. A custom model learns the patterns unique to your domain — the vocabulary of your industry, the seasonality of your demand, the edge cases a generic system has never seen.",
          "We start every engagement by understanding the decision the model needs to support and the data available to support it. That framing determines everything downstream: which algorithm fits, how to measure success, and what accuracy is actually worth achieving. The result is a model tuned to the problem that matters, not a demo that impresses in a slide deck and disappoints in production.",
        ],
      },
      {
        heading: "The Full Lifecycle, From Raw Data to Live Predictions",
        body: [
          "A model is only the visible tip of a working ML system. Most of the effort — and most of the risk — lives in the parts nobody sees: data collection and cleaning, feature engineering, rigorous evaluation, and the deployment plumbing that serves predictions reliably. We own that full lifecycle so you get a system that works, not a notebook that has to be rebuilt before it can ship.",
          "That means honest evaluation on held-out data, not cherry-picked examples. It means deployment as an API or batch pipeline that fits your existing stack. And it means monitoring for drift, so the model that performs today keeps performing as your data changes tomorrow. We build for the day after launch, not just launch day.",
        ],
      },
      {
        heading: "Where Custom ML Pays Off",
        body: [
          "Predictive analytics and forecasting turn historical data into forward-looking decisions — demand planning, churn prediction, risk scoring. Classification and regression models automate judgments that currently consume expert time. Recommendation systems surface the right product, content, or action at the right moment. Natural language processing extracts structure and meaning from the unstructured text buried in your business.",
          "The common thread is leverage: a well-built model applies expert-level judgment consistently, at a scale and speed no team can match manually. When the volume is high and accuracy matters, custom machine learning is one of the clearest returns in applied AI.",
        ],
      },
    ],
    features: [
      "Predictive analytics and forecasting",
      "Classification and regression models",
      "Recommendation systems",
      "Natural language processing",
      "Model optimization, tuning, and monitoring",
    ],
  },
  {
    slug: "computer-vision-solutions",
    icon: Eye,
    title: "Computer Vision Solutions",
    shortDescription:
      "Visual AI systems that see, understand, and analyze images and video for automation and insight.",
    metaDescription:
      "Computer vision solutions for business: object detection, visual quality inspection, document processing, and video analytics — trained, deployed, and monitored in production.",
    keywords: [
      "computer vision solutions",
      "object detection",
      "visual inspection AI",
      "image classification",
      "video analytics",
    ],
    intro:
      "An enormous share of business-critical information arrives as images and video — products on a line, documents in a queue, footage from a camera. Computer vision turns that visual data into structured signals your systems can act on. We build vision systems that detect, classify, and analyze at speeds and consistency no human inspector can sustain.",
    sections: [
      {
        heading: "Seeing What Matters, Reliably",
        body: [
          "Human visual inspection is powerful but fragile. Attention drifts, fatigue sets in, and consistency erodes over the course of a shift. Computer vision systems apply the same standard to the first item and the ten-thousandth. That reliability is the entire point: for quality control, safety monitoring, or high-volume processing, consistency is worth more than occasional brilliance.",
          "We train models on your actual visual data — your products, your defects, your conditions — because a system trained on stock imagery fails the moment it meets your real-world lighting, angles, and edge cases. The goal is a system that holds up on the messy inputs of production, not one that only shines on a clean test set.",
        ],
      },
      {
        heading: "From Detection to Decision",
        body: [
          "Detecting an object or reading a label is only the first step. A useful vision system connects what it sees to a decision: flag this part as defective, route this document to accounts payable, alert an operator to this event. We design the full path from pixels to action, including the confidence thresholds that decide when the system acts automatically and when it escalates to a person.",
          "That confidence-based routing is what makes vision practical at scale. High-certainty cases flow through automatically; ambiguous ones get human review. You capture the labor savings on the easy majority while keeping a safety net exactly where errors are most likely — and you raise the automation threshold as the system earns trust.",
        ],
      },
      {
        heading: "Deployed Where the Work Happens",
        body: [
          "Vision systems often need to run close to the action — on a production line, in a warehouse, at the edge — where latency and connectivity constraints rule out round-trips to the cloud. We deploy on the hardware that fits your environment, from cloud inference to edge devices delivering sub-second results on the factory floor.",
          "Common applications include object detection and tracking, image classification, visual quality inspection, document and receipt processing, and video analytics. Whatever the surface, the discipline is the same: train on real data, wire in human review where it counts, and monitor accuracy over time so performance holds as conditions change.",
        ],
      },
    ],
    features: [
      "Object detection and tracking",
      "Image classification",
      "Visual quality inspection",
      "Document and receipt processing",
      "Video analytics and edge deployment",
    ],
  },
  {
    slug: "ai-process-automation",
    icon: Cog,
    title: "AI Process Automation",
    shortDescription:
      "Intelligent automation that reduces manual work, improves accuracy, and scales your operations.",
    metaDescription:
      "AI process automation for business: intelligent document processing, data extraction, workflow automation, and automated reporting integrated with your existing systems.",
    keywords: [
      "AI process automation",
      "intelligent document processing",
      "workflow automation",
      "data extraction",
      "business process automation",
    ],
    intro:
      "Every business runs on repetitive processes — moving data between systems, extracting fields from documents, generating the same reports every week. Traditional automation handles the rigid parts but breaks on anything that requires judgment. AI process automation closes that gap, handling the ambiguous, unstructured work that used to demand a person.",
    sections: [
      {
        heading: "Automating the Judgment, Not Just the Clicks",
        body: [
          "Rule-based automation is excellent when inputs are perfectly structured and predictable. Real business processes rarely are. Invoices arrive in a hundred layouts, emails vary in wording, forms come in half-completed. The moment a process needs to interpret rather than merely transfer, classic automation stalls and a human has to step back in.",
          "AI-powered automation is built for exactly that ambiguity. It reads a document it has never seen in a new format, understands an email's intent, and decides where a request should go. This is what lets you automate the messy middle of a process — the part that consumed the most human time precisely because it required interpretation.",
        ],
      },
      {
        heading: "Confidence, Validation, and Human Review",
        body: [
          "Automating judgment safely requires knowing when the system is unsure. Every automated decision we build carries a calibrated confidence score, and business rules validate the output before it flows downstream. High-confidence results are processed automatically; anything uncertain routes to a person for a quick check.",
          "This design captures most of the savings immediately while keeping a human safety net where errors are most likely. As the system proves itself on your real workload, you raise the automation threshold and expand its reach — a dial you control, not an all-or-nothing switch you flip and hope for the best.",
        ],
      },
      {
        heading: "Integrated With the Systems You Already Run",
        body: [
          "Automation that lives in a silo just moves the manual work somewhere else. We integrate directly with your existing tools — your ERP, CRM, ticketing system, and databases — so data flows end to end without a person copying it between screens. The automation fits your operation rather than forcing you to rebuild around it.",
          "Typical applications include workflow automation, intelligent document processing, data extraction and validation, automated reporting, and integration between systems that never spoke to each other. The impact is direct: processing time drops from minutes to seconds, error rates fall, and your team shifts from data entry to the higher-value work only people can do.",
        ],
      },
    ],
    features: [
      "Workflow automation",
      "Intelligent document processing",
      "Data extraction and validation",
      "Automated reporting",
      "Integration with existing systems",
    ],
  },
  {
    slug: "ai-agent-orchestration",
    icon: Network,
    title: "AI Integration & Agent Orchestration",
    shortDescription:
      "Coordinated AI agent systems that handle complex, end-to-end workflows — giving lean teams enterprise-grade operational power.",
    metaDescription:
      "AI agent orchestration for business: multi-agent system architecture, workflow automation, and integration that gives lean teams enterprise-grade operational capacity.",
    keywords: [
      "AI agent orchestration",
      "multi-agent systems",
      "AI integration",
      "workflow automation",
      "autonomous agents for business",
    ],
    intro:
      "The next step beyond automating single tasks is coordinating many of them. Multi-agent AI systems assign specialized agents to plan, execute, and check work across an entire process — multiplying a small team's capacity. We design, build, and deploy coordinated agent systems that run complex workflows end to end, with the control and observability that make them safe to depend on.",
    sections: [
      {
        heading: "Specialized Agents, Clear Contracts",
        body: [
          "A single model asked to do everything is unpredictable. A system of specialized agents — one to triage, one to research, one to draft, one to review — is far more reliable, because each agent owns a single, well-bounded responsibility. Reliability comes from constraints, not cleverness: every agent has a tight contract defining its inputs, its tools, and the exact shape of its output.",
          "We scope tool access per agent on a least-privilege basis. A research agent reads but never writes; an action agent drafts but never sends without approval. That discipline limits the blast radius when something goes wrong and makes the whole system auditable — you can always see which agent had the authority to act.",
        ],
      },
      {
        heading: "Orchestration and Control",
        body: [
          "Agents rarely coordinate well by talking freely to each other; they loop, drift, and burn budget. We use a central orchestrator that holds the goal, decides which agent runs next, and passes structured state between steps. Every transition is logged, every run is replayable, and hard limits prevent a task from spiraling.",
          "Irreversible actions — sending a customer email, issuing a refund, deleting records — route through approval gates. The agents do the work up to the decision point; a human confirms the step that cannot be undone. As confidence in a path grows, you widen the autonomy; if quality slips, you tighten it. Human-in-the-loop is a dial you control, not a bet you place.",
        ],
      },
      {
        heading: "Enterprise Capacity for Lean Teams",
        body: [
          "The payoff is leverage. A well-built agent system lets a small team operate with the throughput of a much larger one — handling operations, support, and data processing at a scale that would otherwise require significant headcount. The agents work continuously, apply consistent judgment, and hand off to people exactly where human judgment adds the most value.",
          "We deliver multi-agent architecture and deployment, workflow automation powered by coordinated agents, integration with the tools and platforms you already use, and ongoing optimization as your processes evolve. We start small — one reliable workflow — prove the value, and expand from there, so you scale automation on evidence rather than hope.",
        ],
      },
    ],
    features: [
      "Multi-agent system architecture and deployment",
      "Workflow automation with AI-powered agents",
      "Seamless integration with your existing tools and platforms",
      "Custom agent teams for operations, support, and data processing",
      "Ongoing optimization and agent performance monitoring",
    ],
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
