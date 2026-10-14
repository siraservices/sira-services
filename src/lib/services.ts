import { Brain, Eye, Cog, Network, Globe, type LucideIcon } from "lucide-react";

export interface ServiceSection {
  heading: string;
  body: string[];
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface Service {
  slug: string;
  icon: LucideIcon;
  title: string;
  /** One-line summary used on the services listing cards. */
  shortDescription: string;
  /** Mono eyebrow shown above the title on cards and the detail page. */
  eyebrow: string;
  /** Cover image (a real case-study cover) shown on the listing and detail page. */
  image: string;
  imageAlt: string;
  /** SEO meta description for the detail page. */
  metaDescription: string;
  keywords: string[];
  /** Opening paragraph on the detail page. */
  intro: string;
  sections: ServiceSection[];
  features: string[];
  /** Five buyer questions rendered as an FAQ section with FAQPage structured data. */
  faqs: ServiceFaq[];
}

export const services: Service[] = [
  {
    slug: "machine-learning-development",
    icon: Brain,
    title: "Machine Learning Development",
    eyebrow: "01 · Models",
    image: "/images/case-studies/ai-generated-image-detection-insurance-claims.jpg",
    imageAlt: "AI-generated image detection: a claim photo scored 87% likely AI-generated",
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
    faqs: [
      {
        question: "How much does custom machine learning development cost?",
        answer:
          "Most machine learning projects we take on land in the five-figure range. A focused model with clean data and a clear success metric typically runs in the low five figures; a system that also needs data pipelines, a serving API, and monitoring sits higher. We scope a fixed price after a short discovery call rather than billing open-ended hours, so you know the number before work starts. If your problem is smaller than that, we say so and point you to a simpler approach. Sometimes a rule or an off-the-shelf model is the honest answer.",
      },
      {
        question: "How long does a machine learning project take?",
        answer:
          "A typical engagement runs six to twelve weeks from kickoff to a model running in production. The first two weeks go to understanding the decision the model supports, auditing the data, and agreeing on how success will be measured. Training and evaluation take the middle stretch, and the final weeks cover deployment, integration with your systems, and handover. Timelines stretch when data has to be collected or labeled first, so we flag that early rather than discovering it halfway through.",
      },
      {
        question: "What data do you need from us to get started?",
        answer:
          "Enough historical examples of the thing you want to predict, with the outcome attached. For churn, that means customer records and who left; for demand forecasting, sales history by period. A few thousand clean rows is often a workable start for tabular problems, though more always helps. We also need read access to wherever that data lives, whether a database export, a warehouse connection, or a set of files, plus someone on your side who can answer questions about what the fields mean.",
      },
      {
        question: "What happens after the model is deployed?",
        answer:
          "Models drift. The patterns in your data shift as your business, customers, and seasons change, and a model that was accurate at launch quietly degrades without anyone noticing. Every deployment we ship includes monitoring on prediction quality and input distribution, so you see degradation before it costs you. From there, most clients choose a light retainer: periodic retraining on fresh data, threshold tuning, and a point of contact when something looks off. Others take the documented pipeline in house, which we fully support.",
      },
      {
        question: "Who actually does the machine learning work?",
        answer:
          "Julio Aira, a licensed professional engineer, does the work personally. Nothing is handed off to a junior team or outsourced overseas. That matters for machine learning consulting because the hard parts, such as framing the problem, deciding what accuracy is worth achieving, and catching a leak in the evaluation, depend on judgment rather than just code. You talk to the engineer who builds and ships your model, from the first data audit to the monitoring dashboard, and the same person is reachable after launch.",
      },
    ],
  },
  {
    slug: "computer-vision-solutions",
    icon: Eye,
    title: "Computer Vision Solutions",
    eyebrow: "02 · Vision",
    image: "/images/case-studies/real-time-poker-computer-vision.jpg",
    imageAlt: "Real-time poker capture pipeline running at 66.95 FPS with 14.4 ms latency",
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
    faqs: [
      {
        question: "How much does a custom computer vision system cost?",
        answer:
          "Custom computer vision development is usually a five-figure investment. A single-camera detection or classification system with a clear pass/fail decision sits at the lower end; multi-camera deployments, real-time tracking, or edge hardware integration push toward the upper end. The biggest cost driver is data: if we need to collect and label images from your environment, that adds time and budget. We price a fixed scope after a discovery call and a look at sample footage, and we will tell you if a simpler sensor or an off-the-shelf tool would solve the problem for less.",
      },
      {
        question: "Do we need special cameras or hardware?",
        answer:
          "Usually not to start. Modern phone cameras, standard IP cameras, and most existing CCTV feeds provide enough resolution for detection and classification tasks. What matters more is consistent lighting, a stable camera position, and a clear view of the thing you care about. Where hardware does matter is at the edge: if inference has to run on a production line without a cloud round-trip, we specify a compact GPU device such as an NVIDIA Jetson. We tell you what you actually need after reviewing sample footage, not sell you equipment up front.",
      },
      {
        question: "How long does it take to build and deploy?",
        answer:
          "Eight to sixteen weeks is typical. The first few weeks go to collecting and labeling representative images from your real environment, with your lighting, your angles, and your defects, because a model trained on stock imagery fails on day one. Training and evaluation follow, then deployment to the cloud or an edge device, integration with whatever system acts on the results, and a supervised pilot on live data. If you already have labeled images, the front end of that timeline shrinks considerably.",
      },
      {
        question: "What data and access do you need from us?",
        answer:
          "Representative images or video from the actual cameras and conditions the system will run in, including the ugly cases: poor lighting, partial occlusion, the defect that only shows up on the night shift. A few hundred examples per category is a reasonable starting point for many tasks. We also need to know what should happen when the system sees something, whether that is flag it, log it, or stop the line, and access to the system that receives that signal. If labeling is needed, we set up the tooling and work from your team's domain input.",
      },
      {
        question: "What happens after the system goes live?",
        answer:
          "Vision systems are sensitive to change: a new product variant, a relocated camera, a seasonal shift in daylight through the loading-dock door. We ship every deployment with accuracy monitoring and a review queue for low-confidence cases, so performance holds and you see problems early. Most clients keep a monthly retainer for periodic retraining as new examples accumulate, threshold adjustments, and support when something changes on the floor. The code, model weights, and documentation are yours either way, and Julio builds and supports the system himself.",
      },
    ],
  },
  {
    slug: "ai-process-automation",
    icon: Cog,
    title: "AI Process Automation",
    eyebrow: "03 · Automation",
    image: "/images/case-studies/ai-email-classification-industrial-manufacturer.jpg",
    imageAlt: "Inbound emails classified by Claude into 10 business categories with confidence scores",
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
    faqs: [
      {
        question: "How much does AI process automation cost?",
        answer:
          "Small automation projects typically run in the low thousands of dollars. A single workflow, such as classifying inbound email, extracting invoice fields into your accounting system, or generating a weekly report, usually lands between a few thousand and the low five figures depending on how many systems it touches and how much judgment it has to apply. Larger programs that automate several connected processes cost more. We quote a fixed scope after a short call. AI automation for small business is often the fastest payback of anything we build, because the manual hours it replaces are easy to count.",
      },
      {
        question: "Do you use n8n, Zapier, or custom code?",
        answer:
          "Whichever fits. For straightforward workflows that connect common SaaS tools, n8n or a similar platform is faster to build, easier for your team to see and adjust, and cheaper to run. When a process needs real judgment, such as reading unstructured documents, routing on intent, or applying business rules with confidence scores, we write custom code around a language model and host it on infrastructure you control. Many projects mix both: a no-code layer for the plumbing and a custom service for the step that requires interpretation. You get the source and the credentials either way.",
      },
      {
        question: "How long does it take to automate a process?",
        answer:
          "Two to six weeks for a single workflow is typical. The first week maps the process as it actually runs, not how the manual says it runs, and gathers real examples of the documents or messages involved. Building and testing take the middle stretch, including a period where the automation runs alongside your team so you can compare results. Then it goes live with human review on the uncertain cases. Processes with many exceptions or several systems to integrate take longer, and we say so up front.",
      },
      {
        question: "What access do you need to our systems?",
        answer:
          "API access or an integration account for each system the workflow touches, whether that is your email, CRM, ERP, ticketing tool, or database, scoped to the minimum permissions the automation needs. We also need a representative sample of the real inputs, including the messy ones, and a person who can tell us what the right outcome looks like when it is ambiguous. Credentials stay in your accounts. We build with least-privilege access and document every connection so you can revoke or rotate it at any time.",
      },
      {
        question: "What happens after the automation is running?",
        answer:
          "Automations break when the world around them changes: a vendor redesigns their invoice, a tool updates its API, a new category of request appears. Every workflow we ship logs its decisions and confidence scores and routes anything uncertain to a person, so a change shows up as a spike in the review queue rather than a silent failure. Most clients keep a modest monthly retainer for monitoring, fixes, and small extensions as they find the next process to automate. Julio builds and maintains it personally, and everything is documented so your team could take it over.",
      },
    ],
  },
  {
    slug: "ai-agent-orchestration",
    icon: Network,
    title: "AI Integration & Agent Orchestration",
    eyebrow: "04 · Agents",
    image: "/images/case-studies/ai-agent-orchestration.jpg",
    imageAlt: "A coordinated set of AI agents handing work between an inbox, a CRM and a human reviewer",
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
    faqs: [
      {
        question: "How much does AI agent development cost?",
        answer:
          "Agent systems are usually a five-figure project. A single well-bounded agent that handles one workflow, such as triaging support tickets, drafting responses for review, or researching and summarizing leads, sits at the low end. A multi-agent system with an orchestrator, several tools, approval gates, and full logging costs more, because reliability engineering is most of the work. We price a fixed scope and start with one workflow rather than a sprawling system, so you see value before committing further budget. If a simpler automation would do the job, we recommend that instead.",
      },
      {
        question: "How long does it take to build an agent system?",
        answer:
          "Four to ten weeks for a first production workflow. Designing the agent contracts, meaning what each one may read, what it may do, and the exact shape of its output, takes the first stretch, and it is where most of the quality is decided. Building and testing against real cases follow, then a supervised period where a person approves every action before autonomy widens. Additional workflows go faster once the orchestration, logging, and approval infrastructure exist.",
      },
      {
        question: "What data and tool access do agents need?",
        answer:
          "Agents act through tools, so we need API access to the systems they will read from and write to, scoped per agent on a least-privilege basis: a research agent gets read access only, and an action agent gets write access behind an approval gate. We also need examples of the work being done well today, any documentation or policies the agents should follow, and a clear list of actions that must always route to a human. Everything runs in your accounts with your keys, so you can revoke access at any time.",
      },
      {
        question: "What happens after the agents are deployed?",
        answer:
          "Agent systems need ongoing attention more than most software, because the underlying models change, prompts drift in effectiveness, and new edge cases appear in production. Every system we ship logs each run, so you can replay and audit any decision. Most clients keep a monthly retainer covering monitoring, prompt and tool adjustments, model upgrades, and the gradual widening of autonomy as a path earns trust. We treat human-in-the-loop as a dial you adjust over time, not a setting fixed at launch.",
      },
      {
        question: "Who builds the agents, and do you outsource?",
        answer:
          "Julio Aira, a licensed professional engineer, designs and builds every system himself. AI agent development here is not outsourced or handed to subcontractors. That matters more than in most software work, because the decisions that make agents safe, such as what each one is allowed to do, where approval gates sit, and how failures are contained, are engineering judgment calls. The person making them should be the one you can call when something behaves unexpectedly. You work with the same engineer from design through deployment and after.",
      },
    ],
  },
  {
    slug: "websites-and-maintenance",
    icon: Globe,
    title: "Websites & Maintenance",
    eyebrow: "05 · Web",
    image: "/images/case-studies/jorge-siesta-key.jpg",
    imageAlt: "A direct-booking vacation rental website shown on desktop and phone",
    shortDescription:
      "Fast, well-built websites for small businesses — Shopify, WordPress or custom Next.js — plus a monthly care plan so they stay that way.",
    metaDescription:
      "Website design, build and maintenance for small businesses: Shopify storefronts, WordPress rebuilds and custom Next.js sites, with monthly updates, fixes and monitoring.",
    keywords: [
      "small business website design",
      "Shopify website maintenance",
      "WordPress website rebuild",
      "Next.js website development",
      "website maintenance plan",
    ],
    intro:
      "Most small-business websites fail quietly: a stale menu, a broken checkout on phones, a theme update nobody checked. We build sites that look like the business they represent and then keep them running, so the owner can stay in the kitchen, on the job site or with the guests instead of in a site editor.",
    sections: [
      {
        heading: "Built on the Platform That Fits the Business",
        body: [
          "A meal-prep company selling on a weekly cutoff belongs on Shopify. A neighborhood magazine with a growing archive and a staff that publishes daily belongs on WordPress. A vacation rental that wants one fast, beautiful page belongs on a custom Next.js site deployed to Vercel. We have shipped all three, and we choose the platform for the business rather than for ourselves.",
          "Every build starts from the real content: the owner's photos, the actual menu, the honest set of services. The design leans on strong typography, full-bleed photography and a single clear call to action, and it is checked at phone width first, because that is where most customers arrive.",
        ],
      },
      {
        heading: "Maintenance That Keeps the Site Earning",
        body: [
          "The care plan covers the work that otherwise piles up: weekly content and menu updates, announcement and cutoff messaging, theme and layout fixes, app and plugin updates checked after each platform release, backups before anything changes, and a quick turnaround when something breaks. Requests go in by text or email and ship the same week.",
          "For e-commerce stores we also keep an eye on the parts that cost money when they slip: checkout on mobile, page speed, broken links, and the default settings platforms leave behind, such as a store title still reading 'My Store'.",
        ],
      },
      {
        heading: "Where It Overlaps With Our AI Work",
        body: [
          "Because we also build AI automation, a website engagement can grow into more when it makes sense: an inbox triaged automatically, a chat assistant trained on the business's own content, or a dashboard that pulls orders and bookings into one place. None of that is required to start, and most clients begin with a simple build or a care plan.",
        ],
      },
    ],
    features: [
      "Shopify storefront setup, theme work and weekly updates",
      "WordPress rebuilds and editorial sites",
      "Custom Next.js sites on Vercel for one-page brands",
      "Monthly care plan: updates, fixes, backups and monitoring",
      "Mobile-first checks on checkout, speed and links",
    ],
    faqs: [
      {
        question: "How much does a small business website cost?",
        answer:
          "Most of our website builds land in the low thousands. A one-page Next.js site for a rental, a restaurant, or a trade business sits at the low end. A Shopify storefront with products, shipping rules, and a theme customized to the brand, or a WordPress rebuild with a content archive, sits higher. Ongoing website maintenance is a separate monthly plan priced by how much changes week to week. We quote a fixed price after seeing your current site and content, and we will say if a simpler option fits your budget better.",
      },
      {
        question: "Do you maintain Shopify stores?",
        answer:
          "Yes, and it is a large part of what the care plan covers. Weekly product and menu updates, cutoff and announcement banners, theme adjustments, app updates checked after each Shopify release, and a mobile checkout test every time something changes. We also clean up the defaults Shopify leaves behind that quietly cost sales, like a store title still reading 'My Store' or an unconfigured shipping zone. Requests come in by text or email and ship the same week. We maintain WordPress and custom Next.js sites on the same terms.",
      },
      {
        question: "How long does a website build take?",
        answer:
          "Two to five weeks for most sites. A one-page custom site can be live in two weeks when photos and copy are ready. A Shopify store takes longer because products, variants, shipping, and payments have to be set up and tested. A WordPress rebuild depends on how much content has to be migrated and cleaned. The longest delays are almost always waiting on content, so we start by collecting the real photos, menu, and service list before design begins.",
      },
      {
        question: "What do you need from us to get started?",
        answer:
          "Your real content: photos of the business, the actual menu or service list, pricing, hours, and any copy you already like. Access to your domain registrar and existing hosting so we can point the domain when the site is ready, and to your Shopify or WordPress admin if we are working on an existing site. For a new build we set up hosting on Vercel, Shopify, or a managed WordPress host in your name, so you own the accounts from day one. Julio does the build and the maintenance himself.",
      },
      {
        question: "What does website maintenance include each month?",
        answer:
          "The monthly website maintenance plan covers content updates, fixes, and monitoring so the site keeps earning without you logging in. That means text, menu, and product changes, theme and layout fixes, plugin and app updates with a backup taken first, broken-link and page-speed checks, and a quick turnaround when something breaks. For stores we also check mobile checkout after every change. There is no long contract; the plan runs month to month, and you can pause it when the site is quiet.",
      },
    ],
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
