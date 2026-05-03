import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Seed the blog with initial posts
export const blogPosts = mutation({
  args: {},
  handler: async (ctx) => {
    const existingPost = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) =>
        q.eq("slug", "computer-vision-transforming-quality-control-manufacturing")
      )
      .first();

    if (existingPost) {
      return { message: "Blog post already exists", postId: existingPost._id };
    }

    const now = Date.now();
    const postId = await ctx.db.insert("posts", {
      title: "How Computer Vision is Transforming Quality Control in Manufacturing",
      slug: "computer-vision-transforming-quality-control-manufacturing",
      excerpt:
        "Discover how computer vision technology is revolutionizing manufacturing quality control through automated defect detection, real-time monitoring systems, and significant cost savings.",
      content: `<p>Manufacturing has always been driven by the pursuit of perfection. Today, computer vision is leading a new revolution in quality control, enabling manufacturers to detect defects with unprecedented accuracy, monitor production in real-time, and achieve substantial cost savings. Let's explore how this transformative technology is reshaping the industry.</p>

<h2>Defect Detection: Seeing What the Human Eye Cannot</h2>

<p>Traditional quality control relied heavily on human inspectors, whose effectiveness could be limited by fatigue, inconsistency, and the sheer volume of products requiring inspection. Computer vision systems have changed this paradigm entirely.</p>

<p>Modern computer vision systems use high-resolution cameras and sophisticated deep learning algorithms to analyze products at speeds and accuracy levels impossible for human inspectors. These systems can detect microscopic cracks, surface imperfections, color variations, and dimensional inaccuracies in milliseconds.</p>

<p>For example, in semiconductor manufacturing, computer vision systems inspect silicon wafers for defects as small as a few nanometers. In automotive manufacturing, they verify paint quality, weld integrity, and component alignment with sub-millimeter precision. The result is a dramatic reduction in defective products reaching customers.</p>

<p>What makes these systems particularly powerful is their ability to learn and improve over time. Machine learning models trained on thousands of defect examples become increasingly accurate at identifying even subtle anomalies that might escape initial detection parameters.</p>

<h2>Real-Time Monitoring: Continuous Vigilance on the Production Line</h2>

<p>Beyond individual product inspection, computer vision enables comprehensive real-time monitoring of entire production processes. This continuous oversight provides manufacturers with unprecedented visibility into their operations.</p>

<p>Smart cameras positioned throughout the production line capture and analyze video feeds continuously. These systems can track production flow, identify bottlenecks, monitor equipment performance, and even predict maintenance needs before failures occur.</p>

<p>Real-time monitoring also enables immediate response to quality issues. When a defect pattern emerges, the system can alert operators instantly, allowing them to address the root cause before it affects additional products. This proactive approach minimizes waste and prevents larger quality incidents.</p>

<p>Integration with Industrial Internet of Things (IIoT) platforms amplifies these capabilities. Computer vision data combined with sensor readings, machine parameters, and environmental conditions creates a comprehensive picture of production health, enabling data-driven decision-making at every level.</p>

<h2>Cost Savings: The Business Case for Computer Vision</h2>

<p>The financial benefits of implementing computer vision in quality control are compelling and measurable. Manufacturers across industries report significant returns on their investments.</p>

<p><strong>Reduced Inspection Costs:</strong> Automated inspection systems can operate 24/7 without breaks, vacations, or training time. A single computer vision system can often replace multiple human inspectors while providing more consistent results.</p>

<p><strong>Lower Defect Rates:</strong> By catching defects earlier in the production process, manufacturers avoid the compounding costs of processing defective materials through subsequent production stages. Early detection can reduce scrap rates by 50% or more.</p>

<p><strong>Decreased Warranty Claims:</strong> Higher quality products mean fewer returns and warranty claims. For manufacturers of high-value goods, even a small improvement in outgoing quality can translate to millions in avoided warranty costs.</p>

<p><strong>Improved Yield:</strong> Real-time process monitoring enables continuous optimization, improving overall production yield. Manufacturers commonly report yield improvements of 10-20% after implementing comprehensive computer vision systems.</p>

<p><strong>Enhanced Brand Value:</strong> Consistent quality builds customer trust and brand reputation. In competitive markets, a reputation for quality can command premium pricing and customer loyalty.</p>

<h2>Looking Forward</h2>

<p>The integration of computer vision into manufacturing quality control is still evolving. Advances in edge computing enable faster, more distributed processing. New sensor technologies expand what computer vision systems can perceive. And continued improvements in AI algorithms make these systems ever more capable and adaptable.</p>

<p>For manufacturers considering computer vision adoption, the question is no longer whether to implement these technologies, but how quickly they can begin reaping the benefits. Those who embrace this transformation are positioning themselves at the forefront of manufacturing excellence.</p>`,
      tags: ["computer-vision", "manufacturing"],
      published: true,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return { message: "Blog post created and published", postId };
  },
});

// Seed case studies with AI/ML themed samples
export const caseStudiesData = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("caseStudies")
      .withIndex("by_slug", (q) =>
        q.eq("slug", "ai-powered-demand-forecasting-retail")
      )
      .first();

    if (existing) {
      return { message: "Case studies already seeded" };
    }

    const now = Date.now();

    await ctx.db.insert("caseStudies", {
      title: "AI-Powered Demand Forecasting for a Retail Chain",
      slug: "ai-powered-demand-forecasting-retail",
      client: "European Retail Group",
      description:
        "Built a machine learning demand forecasting system that reduced inventory waste by 34% and improved stock availability across 120 store locations.",
      challenge:
        "The client operated 120 stores across three countries and relied on manual spreadsheet-based ordering processes. Overstock and stockouts cost them an estimated €2.4M annually. Seasonal patterns, promotions, and regional preferences made accurate forecasting nearly impossible with traditional methods.",
      solution:
        "We designed and deployed a gradient boosting ensemble model trained on four years of sales history, enriched with weather data, local events, and promotional calendars. The system generates daily SKU-level forecasts 14 days ahead, delivered via a Streamlit dashboard integrated with their ERP. A feedback loop retrains the model weekly on new sales data.",
      results:
        "34% reduction in overstock waste in the first quarter post-launch. Stockout rate fell from 8.2% to 2.1%. Store managers reported saving an average of 6 hours per week on manual ordering tasks. The system paid for itself within five months of deployment.",
      tags: ["machine-learning", "forecasting", "retail", "python"],
      published: true,
      publishedAt: now - 30 * 24 * 60 * 60 * 1000,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("caseStudies", {
      title: "Computer Vision Quality Control for PCB Manufacturing",
      slug: "computer-vision-pcb-quality-control",
      client: "Electronics Manufacturer (NDA)",
      description:
        "Deployed a real-time computer vision inspection system that detects PCB defects with 99.3% accuracy, replacing manual inspection and cutting quality escapes by 91%.",
      challenge:
        "The client's manual PCB inspection process was a bottleneck — inspectors could only review 200 boards per hour and fatigue caused error rates to rise sharply after the first two hours of a shift. Defective boards reaching customers were generating costly warranty claims and damaging the company's reputation.",
      solution:
        "We trained a custom YOLOv8 model on 40,000 annotated PCB images covering solder bridges, missing components, polarity errors, and lifted pads. Cameras were integrated at three points on the production line. The inference runs on edge hardware (NVIDIA Jetson) for sub-100ms latency. Defect images and metadata stream to a quality dashboard for root-cause analysis.",
      results:
        "Inspection throughput increased from 200 to 1,400 boards per hour. Defect detection accuracy reached 99.3% on the holdout test set. Quality escapes to customers dropped by 91% in the first six months. The system flagged a component batch variance that was causing a recurring solder defect — saving an estimated $180K in rework.",
      tags: ["computer-vision", "manufacturing", "deep-learning", "edge-ai"],
      published: true,
      publishedAt: now - 60 * 24 * 60 * 60 * 1000,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("caseStudies", {
      title: "LLM-Driven Customer Support Automation for SaaS",
      slug: "llm-customer-support-automation-saas",
      client: "B2B SaaS Platform",
      description:
        "Integrated a RAG-based support assistant that resolves 68% of tier-1 tickets automatically, reducing average response time from 4 hours to under 2 minutes.",
      challenge:
        "A fast-growing SaaS company was drowning in support tickets as their user base scaled from 5,000 to 40,000 accounts. Their three-person support team faced a backlog of 800+ open tickets. Most tier-1 tickets were repetitive — password resets, billing questions, and how-to queries well covered in existing documentation.",
      solution:
        "We built a retrieval-augmented generation (RAG) pipeline over the client's knowledge base (Confluence + Zendesk macros), deployed as a Zendesk app. Claude handles classification and drafts responses; a confidence threshold determines whether the reply is sent automatically or routed to a human agent for review. Human-approved corrections are fed back to improve retrieval rankings weekly.",
      results:
        "68% of incoming tickets resolved without human intervention within the first month. Average first-response time dropped from 4 hours to 97 seconds. Support team shifted focus to complex, high-value tickets. Customer satisfaction (CSAT) improved from 3.8 to 4.6 out of 5. The client avoided hiring two additional support agents.",
      tags: ["llm", "rag", "customer-support", "automation"],
      published: true,
      publishedAt: now - 15 * 24 * 60 * 60 * 1000,
      createdAt: now,
      updatedAt: now,
    });

    return { message: "Case studies seeded successfully" };
  },
});
