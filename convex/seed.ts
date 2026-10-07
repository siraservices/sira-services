import { internalMutation } from "./_generated/server";

// Internal only: callable via `npx convex run` / the dashboard, not from the
// public internet.
import { v } from "convex/values";

// Seed the blog with initial posts
export const blogPosts = internalMutation({
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
export const caseStudiesData = internalMutation({
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

// Seed the ETT email classifier case study (idempotent, runs independently)
export const ettCaseStudy = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("caseStudies")
      .withIndex("by_slug", (q) =>
        q.eq("slug", "ai-email-classification-industrial-manufacturer")
      )
      .first();

    if (existing) {
      return { message: "ETT case study already exists", id: existing._id };
    }

    const now = Date.now();
    const id = await ctx.db.insert("caseStudies", {
      title: "AI Email Classification for Industrial Manufacturer",
      slug: "ai-email-classification-industrial-manufacturer",
      client: "A leading US-based industrial tools manufacturer",
      description:
        "Built an AI-powered email classification system that automatically categorizes inbound customer emails into 10 business categories with confidence scoring, replacing error-prone manual triage and accelerating response times.",
      challenge:
        "The client's customer service team manually triaged hundreds of inbound emails daily across 10+ categories including quotes, orders, returns, delivery inquiries, and technical requests. Misclassification caused delays in response times, routing errors between departments, and lost revenue. The volume and variety of emails made consistent manual categorization unsustainable as the business scaled.",
      solution:
        "We designed and deployed an AI-powered email classification system using Claude that automatically categorizes inbound emails into 10 distinct business categories with confidence scoring. The system was delivered as a production-ready REST API built with Python and FastAPI, containerized with Docker for seamless deployment into the client's infrastructure. Comprehensive handover documentation — including a runbook, prompt-change protocol, and edge-case reference — ensured the client could operate and evolve the system independently.",
      results:
        "The system classifies emails across 10 business categories with high-confidence automated classification. A production-ready REST API with Docker deployment was delivered on schedule. Complete operational handover documentation enabled client self-sufficiency from day one. The client provided 5-star feedback, citing the quality of both the technical deliverable and the operational documentation.",
      tags: ["ai", "email-classification", "nlp", "claude-api", "python", "docker", "fastapi"],
      published: true,
      publishedAt: now - 7 * 24 * 60 * 60 * 1000,
      createdAt: now,
      updatedAt: now,
    });

    return { message: "ETT case study created", id };
  },
});

/* ------------------------------------------------------------------ */
/* Website & maintenance case studies (added 2026-10)                  */
/* ------------------------------------------------------------------ */

const DAY = 24 * 60 * 60 * 1000;

// Cover images live in the Next.js app at public/images/case-studies/ and
// are served from the site itself, so the paths are site-relative.
const WEBSITE_CASE_STUDIES = [
  {
    slug: "performance-meal-prep-shopify",
    title: "Shopify Storefront Maintenance for a Weekly Meal-Prep Delivery Business",
    client: "Performance Meal Prep, meal delivery across Philadelphia, New Jersey and Delaware",
    description:
      "Ongoing maintenance of a Shopify storefront that runs on a weekly order cycle: menu and collection updates, delivery-cutoff messaging, theme fixes, and keeping checkout working every week.",
    challenge:
      "Performance Meal Prep sells on a weekly rhythm. Customers order by Friday for the following week, with a limited mid-week menu on a separate cutoff, so the storefront has to change every week: new menu items, updated announcement bars, delivery dates, specials, and gift cards. For a business like this the website is the order desk, and a broken theme section, a stale cutoff date, or a slow checkout costs real orders.",
    solution:
      "SIRA maintains the Shopify store as a standing engagement. That covers weekly menu and collection changes, the rotating announcement and delivery-cutoff messaging, theme and layout fixes across desktop and mobile, checking apps and integrations after Shopify updates, and quick turnaround on anything that breaks. Changes are made on the live theme with a backup taken first, so the store never goes dark during the busiest ordering window.",
    results:
      "The storefront keeps up with the weekly cycle without the owners touching code. Menu updates, cutoff dates and specials go live on schedule, the theme stays consistent on phones (where most meal-prep customers order), and the team can spend its time in the kitchen instead of in the Shopify editor.",
    tags: ["website", "shopify", "maintenance", "e-commerce"],
    imageUrl: "/images/case-studies/performance-meal-prep.jpg",
    liveUrl: "https://www.eatpmp.com/",
    publishedAgoDays: 14,
  },
  {
    slug: "jorge-siesta-key-vacation-rental",
    title: "Direct-Booking Website for a Siesta Key Vacation Rental",
    client: "Jorge, owner of a two-bedroom rental in Siesta Key, Florida",
    description:
      "Designed and built an editorial-style website for a renovated Siesta Key condo, giving the owner a fast, shareable home for the property outside the listing marketplaces.",
    challenge:
      "A rental that only exists on booking marketplaces has no home of its own. Jorge wanted a page he could send directly to guests that sells the stay the way a listing can't: the light, the two-minute walk to the beach, the quiet backyard pond. It also had to carry the practical facts (sleeps six, two bedrooms, check-in and check-out times, amenities), load instantly on a phone, and end with a clear way to start a booking.",
    solution:
      "We built the site with Next.js and React and deployed it on Vercel. The design leans editorial: large serif headlines, full-bleed photography, and a slow scroll through four chapters: the home, the property details and amenities, the location with things to do nearby, and a gallery. A single 'begin a stay' call to action runs through the page. Images are optimized and served from Vercel's edge network so the site stays fast on mobile connections.",
    results:
      "Jorge has a live, direct link for the property that he owns outright, with no marketplace fees on the page itself and full control of the copy and photos. The site scores well on mobile performance, presents every detail a guest asks about before booking, and can grow with a booking widget or seasonal pricing without a rebuild.",
    tags: ["website", "next.js", "vercel", "design"],
    imageUrl: "/images/case-studies/jorge-siesta-key.jpg",
    liveUrl: "https://jorge-siesta-key.vercel.app/",
    publishedAgoDays: 12,
  },
  {
    slug: "horseman-wellness-club-shopify",
    title: "Shopify Build and Maintenance for a Chef-Run Meal-Prep Club",
    client: "Horseman Wellness Club, chef-run meal prep with weekly orders and pickup",
    description:
      "Set up and maintain the Shopify storefront for a chef-run meal-prep club: weekly meal-prep ordering with a Friday cutoff, pickup orders, and a photography-led brand that matches the kitchen.",
    challenge:
      "Horseman Wellness Club sells two things on one site: weekly meal preps with a hard Friday 9 PM cutoff, and pickup orders. The brand is built on the chef and the kitchen, so the storefront had to feel like the real thing (full-screen photography, bold type) while still doing ordinary e-commerce work: clear ordering paths, a cart that behaves, and an order window that closes when it should.",
    solution:
      "SIRA built the storefront on Shopify with a full-bleed photographic homepage, hotspot callouts on the hero image, separate ordering flows for meal preps and pickup, and the cutoff messaging pinned to the top of every page. The engagement continues as maintenance: menu changes, cutoff and announcement updates, theme fixes, and checking the store after Shopify platform updates.",
    results:
      "The club has a storefront that looks like its brand and runs its weekly order cycle on its own. Customers see the right cutoff before they order, meal preps and pickup orders go through the right flows, and updates ship the same week they're requested.",
    tags: ["website", "shopify", "maintenance", "e-commerce"],
    imageUrl: "/images/case-studies/horseman-wellness-club.jpg",
    liveUrl: "https://horsemanwellnessclub.com/",
    publishedAgoDays: 10,
  },
  {
    slug: "rowhome-magazine-website-rebuild",
    title: "Website Rebuild for Philadelphia RowHome Magazine",
    client: "Philadelphia RowHome Magazine, a neighborhood lifestyle publication",
    description:
      "In progress: a ground-up rebuild of a Philadelphia neighborhood magazine's WordPress site, with a new editorial design, topic and neighborhood navigation, subscriber login, and a structure built for a growing archive.",
    challenge:
      "RowHome covers Philadelphia row-home life across dozens of topics, from renovation diaries and preservation to food, music and neighborhood guides. The existing site had outgrown its structure: too many sections to browse, no clean way to surface the archive, and a reading experience that didn't match the print magazine. The rebuild had to happen on WordPress, so the magazine's staff could keep publishing without a developer, and it had to roll out without taking the site offline.",
    solution:
      "We are rebuilding the site in phases on WordPress. The new design puts the masthead and a 'Discover' menu up top, organizes stories by topic and by neighborhood, adds contributor pages, subscriber login and a subscribe path, and uses a magazine-style homepage with a lead story, a themed banner slot, and section blocks such as PRH Life and Flashback. Each phase ships to the live site once it's reviewed, so readers always see a working site.",
    results:
      "In progress. The redesigned homepage, navigation, topic taxonomy and contributor pages are live on rowhomemag.com, and the remaining phases are rolling out on the same cadence. This case study will be updated with final results when the rebuild wraps.",
    tags: ["website", "in-progress", "wordpress", "editorial"],
    imageUrl: "/images/case-studies/rowhome-magazine.jpg",
    liveUrl: "https://rowhomemag.com/",
    publishedAgoDays: 8,
  },
];

// Idempotent: inserts each website case study, or refreshes its content if
// the slug already exists. Run with `npx convex run seed:websiteCaseStudies`.
export const websiteCaseStudies = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const created: string[] = [];
    const updated: string[] = [];

    for (const cs of WEBSITE_CASE_STUDIES) {
      const { publishedAgoDays, ...fields } = cs;
      const existing = await ctx.db
        .query("caseStudies")
        .withIndex("by_slug", (q) => q.eq("slug", cs.slug))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, { ...fields, updatedAt: now });
        updated.push(cs.slug);
      } else {
        await ctx.db.insert("caseStudies", {
          ...fields,
          published: true,
          publishedAt: now - publishedAgoDays * DAY,
          createdAt: now,
          updatedAt: now,
        });
        created.push(cs.slug);
      }
    }

    return { created, updated };
  },
});

// Cover images for the existing AI/ML case studies.
const CASE_STUDY_COVERS: Record<string, string> = {
  "real-time-poker-computer-vision":
    "/images/case-studies/real-time-poker-computer-vision.jpg",
  "ai-generated-image-detection-insurance-claims":
    "/images/case-studies/ai-generated-image-detection-insurance-claims.jpg",
  "ai-email-classification-industrial-manufacturer":
    "/images/case-studies/ai-email-classification-industrial-manufacturer.jpg",
};

// Idempotent: sets imageUrl on the case studies above. Pass `force: true`
// to overwrite an image that is already set.
export const caseStudyCovers = internalMutation({
  args: { force: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const set: string[] = [];
    const skipped: string[] = [];
    const missing: string[] = [];

    for (const [slug, imageUrl] of Object.entries(CASE_STUDY_COVERS)) {
      const existing = await ctx.db
        .query("caseStudies")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      if (!existing) {
        missing.push(slug);
      } else if (existing.imageUrl && !args.force) {
        skipped.push(slug);
      } else {
        await ctx.db.patch(existing._id, { imageUrl, updatedAt: Date.now() });
        set.push(slug);
      }
    }

    return { set, skipped, missing };
  },
});
