import { mutation } from "./_generated/server";

// Seed three long-form SEO blog posts (idempotent per-slug).
// Run with: npx convex run seedBlogPosts:posts
export const posts = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const drafts = [
      {
        title: "How to Build a Multi-Agent AI System for Business Operations",
        slug: "how-to-build-multi-agent-ai-system-business-operations",
        excerpt:
          "A practical guide to designing multi-agent AI systems that run real business operations — how to scope roles, coordinate agents, keep humans in the loop, and ship something that actually holds up in production.",
        tags: ["ai-agents", "multi-agent", "automation", "llm"],
        publishedAtOffsetDays: 0,
        content: `<p>Multi-agent AI systems have moved from research demos to production tools that run parts of real businesses. Instead of one large model trying to do everything, a multi-agent system splits work across specialized agents that plan, delegate, and check each other. Done well, this lets a lean team operate with the throughput of a much larger one. Done poorly, it produces an unpredictable tangle that is impossible to trust. This guide walks through how to build a multi-agent AI system for business operations that is reliable enough to depend on.</p>

<h2>Start With the Work, Not the Agents</h2>

<p>The most common mistake is designing agents before understanding the work. Begin by mapping an actual operational process end to end: a support ticket arriving, a lead being qualified, an invoice being reconciled. Write down every decision point, every hand-off, and every place a human currently applies judgment. That map, not a diagram of clever agents, is the real specification.</p>

<p>Once the process is explicit, natural roles emerge. A triage step becomes a classifier agent. A research step becomes a retrieval agent. A drafting step becomes a writer agent. A verification step becomes a reviewer agent. Each agent should own a single, well-bounded responsibility that you could describe in one sentence. If you cannot, the role is too broad and will be unreliable.</p>

<h2>Give Every Agent a Narrow Contract</h2>

<p>Reliability in multi-agent systems comes from constraints, not from cleverness. Every agent needs a tight contract: what inputs it accepts, what tools it may call, and what shape its output must take. Structured outputs — JSON with a fixed schema — are far easier to route, validate, and debug than free-form text passed between agents.</p>

<p>Tool access should be scoped per agent. A research agent might read from a knowledge base but never write to a database. An action agent might create a draft but never send it. This principle of least privilege limits the blast radius when an agent misbehaves, and it makes the system's behavior auditable. When something goes wrong, you can see exactly which agent had the authority to cause it.</p>

<h2>Coordinate With an Orchestrator</h2>

<p>Agents rarely coordinate well by talking freely to one another. A more robust pattern is a central orchestrator that holds the overall goal, decides which agent runs next, and passes structured state between steps. The orchestrator enforces order, handles retries, and decides when the work is complete.</p>

<p>This design keeps the control flow inspectable. You can log every transition, replay a run to reproduce a bug, and set hard limits on how many steps a task may take before it escalates. Free-for-all agent conversations, by contrast, tend to loop, drift off task, and burn budget with nothing to show for it.</p>

<h2>Keep Humans in the Loop Where It Matters</h2>

<p>Full autonomy is the wrong goal for most business operations. The right goal is leverage with control. Identify the actions that are expensive to reverse — sending a customer email, issuing a refund, deleting records — and route those through an approval gate. The agents do the work up to the decision point; a human confirms the irreversible step.</p>

<p>Over time, as confidence in a given path grows, you can raise the confidence threshold at which the system acts on its own and lower it back down if quality slips. Treat the human-in-the-loop boundary as a dial, not a switch. This is how teams safely expand automation without betting the business on a model behaving perfectly every time.</p>

<h2>Instrument Everything From Day One</h2>

<p>A multi-agent system you cannot observe is a system you cannot trust. Log every agent input and output, every tool call, and every orchestrator decision. Track cost and latency per run so a single expensive task cannot quietly balloon your bill. Capture failures with enough context to reproduce them.</p>

<p>These traces are not just for debugging — they are your training data for improvement. Reviewing real runs shows you which agents fail most, which prompts are ambiguous, and where the process map was wrong. Feeding those corrections back is what turns a fragile prototype into a dependable operation.</p>

<h2>Ship Small, Then Expand</h2>

<p>Do not attempt to automate an entire department at once. Pick one narrow, high-volume, low-risk workflow and make it genuinely reliable end to end. Prove the value, earn trust, and only then extend the system to adjacent processes. Each new agent should slot into the same orchestration and observability framework you have already validated.</p>

<p>Multi-agent AI is a powerful way to give a small team enterprise-grade operational capacity. The teams that succeed with it are not the ones with the most agents — they are the ones with the clearest contracts, the tightest control flow, and the discipline to keep a human in the loop where it counts. Build for reliability first, and the leverage follows.</p>`,
      },
      {
        title: "Custom ML Models vs Off-the-Shelf AI: When to Build Your Own",
        slug: "custom-ml-models-vs-off-the-shelf-ai-when-to-build",
        excerpt:
          "Off-the-shelf AI is faster and cheaper to start with, but custom machine learning models win on differentiation and cost at scale. Here is a clear framework for deciding when to build your own versus when to buy.",
        tags: ["machine-learning", "strategy", "custom-ml", "ai"],
        publishedAtOffsetDays: 3,
        content: `<p>Every team adopting AI eventually faces the same fork in the road: use an off-the-shelf model or API, or build a custom machine learning model of your own. Both paths are legitimate, and choosing wrong in either direction is expensive. Build too early and you sink months into infrastructure a hosted API would have handled. Buy too long and you cede your core advantage to a vendor. This article gives you a practical framework for deciding between custom ML models and off-the-shelf AI.</p>

<h2>What "Off-the-Shelf" Actually Gives You</h2>

<p>Off-the-shelf AI — hosted large language models, vision APIs, and pretrained services — is remarkable at breadth. These systems are trained on enormous datasets and handle a huge range of general tasks with no training effort from you. You send a request and get a result. Time to value is measured in days, and you pay per call rather than for infrastructure.</p>

<p>For most teams, this is the correct starting point. If your problem is common — summarizing text, extracting fields from documents, classifying sentiment, transcribing audio — a general model already solves it well. Building a custom model to match capability you can rent by the API call is usually a waste of engineering time and capital.</p>

<h2>What Custom Models Give You</h2>

<p>Custom machine learning models win on three fronts: specificity, cost at scale, and control. A model trained on your data learns the patterns unique to your domain — the vocabulary of your industry, the quirks of your customers, the edge cases a general model has never seen. When accuracy on your specific task is the difference between profit and loss, that specificity matters.</p>

<p>Cost is the second driver. Per-call API pricing is cheap at low volume and punishing at high volume. A workload that costs a few dollars a day in testing can cost thousands a month in production. A custom model running on your own infrastructure has a higher upfront cost but a far lower marginal cost per prediction. Somewhere on the volume curve, owning beats renting.</p>

<p>Control is the third. A custom model runs where you choose, on data that never leaves your environment, with behavior you can freeze and version. For regulated industries, sensitive data, or latency-critical applications, that control is not a luxury — it is a requirement.</p>

<h2>A Decision Framework</h2>

<p>Weigh the decision against four questions. First, <strong>is the task common or proprietary?</strong> Common tasks favor off-the-shelf; proprietary ones favor custom. Second, <strong>what is the volume?</strong> Low and spiky volume favors pay-per-call APIs; high and steady volume favors owned infrastructure. Third, <strong>how important is accuracy on your specific data?</strong> If a few points of accuracy translate to real money, custom training earns its keep. Fourth, <strong>what are your data and compliance constraints?</strong> If data cannot leave your environment, custom is often the only option.</p>

<p>If your answers point mostly toward "common, low-volume, general-purpose, unconstrained," buy. If they point toward "proprietary, high-volume, accuracy-critical, constrained," build. Most real situations land somewhere in between, which points to a hybrid.</p>

<h2>The Hybrid Path Most Teams Actually Take</h2>

<p>The strongest strategy is rarely all-or-nothing. Start with an off-the-shelf model to validate that AI solves the problem and delivers value. This costs little and answers the most important question fastest: does this work at all? Only once the value is proven — and once volume, accuracy needs, or data constraints justify it — do you invest in a custom model for the parts that truly differentiate you.</p>

<p>A common architecture uses a hosted model for the general, low-stakes majority of requests and a custom model for the narrow, high-value slice where specificity pays off. You get fast time to value where it does not matter and hard-won accuracy where it does. Retrieval-augmented approaches also let you inject proprietary knowledge into a general model without training from scratch — a middle ground worth considering before committing to a full custom build.</p>

<h2>The Real Cost Is Rarely the Model</h2>

<p>Whichever path you choose, remember that the model is the smallest part of the total cost. Data collection and labeling, evaluation, monitoring, and ongoing maintenance dominate the budget of any serious AI system. A custom model you cannot evaluate or retrain is a liability, not an asset. An off-the-shelf model you never monitor will drift out from under you as the vendor updates it.</p>

<p>Decide with eyes open. Buy to learn fast and to cover the common cases. Build where accuracy, volume economics, or control make ownership the clear winner — and budget for the operational work that makes either choice hold up over time.</p>`,
      },
      {
        title: "AI-Powered Document Processing: Automating Data Extraction at Scale",
        slug: "ai-powered-document-processing-data-extraction-at-scale",
        excerpt:
          "Manual data entry from invoices, forms, and contracts is slow, costly, and error-prone. Here is how modern AI document processing automates extraction at scale — and how to deploy it reliably.",
        tags: ["document-processing", "automation", "ocr", "ai"],
        publishedAtOffsetDays: 6,
        content: `<p>Businesses still run on documents — invoices, purchase orders, contracts, claims, application forms. For decades, turning those documents into structured data meant people typing fields into systems by hand. It is slow, expensive, and error-prone, and it does not scale. AI-powered document processing changes the economics entirely, automating data extraction at a scale and accuracy that manual entry cannot match. This article explains how it works and how to deploy it reliably.</p>

<h2>Beyond Traditional OCR</h2>

<p>Optical character recognition has existed for years, but classic OCR only converts pixels to characters. It reads the text; it does not understand it. Faced with a real invoice, traditional OCR produces a wall of characters with no idea which number is the total, which date is the due date, or which line items belong together. Every new document layout required brittle, hand-tuned templates that broke the moment a vendor changed their format.</p>

<p>Modern AI document processing combines high-quality OCR with models that understand layout and meaning. These systems read a document the way a person does — recognizing that a value near the word "Total" is the amount due, that a table of rows represents line items, and that a signature block marks an agreement. Because they understand structure and context, they generalize across formats instead of demanding a template for each one.</p>

<h2>How the Pipeline Works</h2>

<p>A production document-processing pipeline usually has four stages. First, <strong>ingestion and classification</strong>: documents arrive by email, upload, or scan, and a model identifies what each one is — an invoice, a contract, a form. Second, <strong>extraction</strong>: the system pulls the relevant fields into a structured format, whether that is header data like totals and dates or nested data like line items and tables.</p>

<p>Third, <strong>validation</strong>: extracted values are checked against business rules and known references. Does the line-item total match the stated total? Is the vendor in your approved list? Is the date plausible? Fourth, <strong>routing</strong>: high-confidence results flow straight into downstream systems, while anything uncertain is routed to a human for a quick review. That confidence-based routing is what makes the system both fast and trustworthy.</p>

<h2>Confidence Scores Are the Key to Trust</h2>

<p>The single most important feature of a reliable extraction system is a calibrated confidence score on every field. Perfect accuracy is not realistic, and a system that silently guesses is dangerous. A system that says "I am 98% sure this total is $4,210 and only 60% sure about this line item" lets you automate the safe majority and escalate the rest.</p>

<p>In practice, teams set a threshold: fields above it are accepted automatically, and fields below it go to a reviewer. As the system proves itself on real documents, you raise the threshold and automate more. This is how you capture most of the labor savings immediately while keeping a human safety net exactly where errors are most likely.</p>

<h2>The Business Impact</h2>

<p>The gains from automating document processing are direct and measurable. Processing time drops from minutes per document to seconds. Error rates fall because the system does not fatigue, misread, or transpose digits the way a tired person at the end of a shift does. Staff shift from tedious data entry to reviewing exceptions and handling higher-value work.</p>

<p>The impact compounds at volume. A team processing thousands of invoices a month recovers enormous capacity, shortens payment cycles, and gains clean structured data for analytics that was previously locked inside PDFs. For document-heavy operations — finance, insurance, logistics, healthcare administration — the return on a well-built extraction system is among the clearest in applied AI.</p>

<h2>Deploying It Reliably</h2>

<p>A successful deployment is more than a model. Start with a representative sample of your real documents, including the messy ones — skewed scans, unusual layouts, handwritten notes — because those edge cases decide whether the system survives contact with production. Build the validation rules that reflect how your business actually works, and wire the human-review path before you turn on automation, not after.</p>

<p>Instrument the pipeline so you can see extraction accuracy, confidence distributions, and how often documents fall to manual review over time. Those metrics tell you when to raise thresholds, where the model is weak, and which document types need attention. Treated this way, AI document processing is not a one-time project but a system that gets steadily more capable — automating data extraction at a scale that manual entry could never reach.</p>`,
      },
    ];

    const results: Array<{ slug: string; status: string; postId?: string }> = [];

    for (const draft of drafts) {
      const existing = await ctx.db
        .query("posts")
        .withIndex("by_slug", (q) => q.eq("slug", draft.slug))
        .first();

      if (existing) {
        results.push({ slug: draft.slug, status: "exists", postId: existing._id });
        continue;
      }

      const publishedAt = now - draft.publishedAtOffsetDays * 24 * 60 * 60 * 1000;
      const postId = await ctx.db.insert("posts", {
        title: draft.title,
        slug: draft.slug,
        excerpt: draft.excerpt,
        content: draft.content,
        tags: draft.tags,
        published: true,
        publishedAt,
        createdAt: now,
        updatedAt: now,
      });

      results.push({ slug: draft.slug, status: "created", postId });
    }

    return { message: "Blog post seed complete", results };
  },
});
