"use node";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { Resend } from "resend";

/** Escape user-supplied strings before interpolating into HTML to prevent injection. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function leadTier(budget: string | undefined): { label: string; color: string } {
  if (budget === "$50k+") return { label: "Tier 1", color: "#16a34a" };
  if (budget === "$15k – $50k") return { label: "Tier 2", color: "#2563eb" };
  if (budget === "$5k – $15k") return { label: "Tier 3", color: "#d97706" };
  return { label: "Tier 4", color: "#6b7280" };
}

export const sendLeadNotifications = internalAction({
  args: {
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    message: v.string(),
    serviceInterest: v.optional(v.string()),
    budget: v.optional(v.string()),
    timeline: v.optional(v.string()),
    projectMaturity: v.optional(v.string()),
    successCriteria: v.optional(v.string()),
    biggestRisk: v.optional(v.string()),
    decisionRole: v.optional(v.string()),
    qualificationTier: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    if (!process.env.RESEND_API_KEY) {
      console.error("[email] RESEND_API_KEY not set — skipping email");
      return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const safeName = escapeHtml(args.name);
    const safeEmail = escapeHtml(args.email);
    const safeMessage = escapeHtml(args.message);
    const tier = leadTier(args.budget);
    const qualTierLabel = args.qualificationTier === "qualified" ? "QUALIFIED" : "nurture";
    const qualTierColor = args.qualificationTier === "qualified" ? "#16a34a" : "#6b7280";
    const companyLine = args.company
      ? `<p><strong>Company:</strong> ${escapeHtml(args.company)}</p>`
      : "";
    const serviceInterestLine = args.serviceInterest
      ? `<p><strong>Service Interest:</strong> ${escapeHtml(args.serviceInterest)}</p>`
      : "";
    const budgetLine = args.budget
      ? `<p><strong>Budget Range:</strong> ${escapeHtml(args.budget)}</p>`
      : "";
    const timelineLine = args.timeline
      ? `<p><strong>Timeline:</strong> ${escapeHtml(args.timeline)}</p>`
      : "";
    const decisionRoleLine = args.decisionRole
      ? `<p><strong>Role:</strong> ${escapeHtml(args.decisionRole)}</p>`
      : "";
    const projectMaturityLine = args.projectMaturity
      ? `<p><strong>Project Stage:</strong> ${escapeHtml(args.projectMaturity)}</p>`
      : "";
    const successCriteriaLine = args.successCriteria
      ? `<p><strong>Success Criteria:</strong></p><blockquote style="border-left:3px solid #16a34a;padding-left:1em;color:#374151;">${escapeHtml(args.successCriteria)}</blockquote>`
      : "";
    const biggestRiskLine = args.biggestRisk
      ? `<p><strong>Biggest Risk:</strong></p><blockquote style="border-left:3px solid #d97706;padding-left:1em;color:#374151;">${escapeHtml(args.biggestRisk)}</blockquote>`
      : "";

    // Admin notification — only sent when ADMIN_EMAIL is configured
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.error("[email] ADMIN_EMAIL not set — skipping admin notification");
    } else {
      try {
        await resend.emails.send({
          from: "Sira Services <noreply@siraservices.com>",
          to: adminEmail,
          subject: `[${qualTierLabel}] New lead from ${safeName} (${tier.label})`,
          html: `
            <h2>New Lead Submission <span style="display:inline-block;padding:2px 10px;border-radius:12px;background:${qualTierColor};color:#fff;font-size:0.8em;">${qualTierLabel}</span> <span style="display:inline-block;padding:2px 10px;border-radius:12px;background:${tier.color};color:#fff;font-size:0.8em;">${tier.label}</span></h2>
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            ${companyLine}
            ${decisionRoleLine}
            ${serviceInterestLine}
            ${budgetLine}
            ${timelineLine}
            ${projectMaturityLine}
            ${successCriteriaLine}
            ${biggestRiskLine}
            <p><strong>Message:</strong></p>
            <blockquote style="border-left:3px solid #2563eb;padding-left:1em;color:#374151;">
              ${safeMessage}
            </blockquote>
          `,
        });
      } catch (err) {
        console.error("[email] Failed to send admin notification:", err);
      }
    }

    // Lead confirmation — always attempted regardless of ADMIN_EMAIL
    try {
      await resend.emails.send({
        from: "Sira Services <noreply@siraservices.com>",
        to: args.email,
        subject: "We received your message — Sira Services",
        html: `
          <h2>Thanks for reaching out, ${safeName}!</h2>
          <p>We've received your message and will get back to you within 1–2 business days.</p>
          <p><strong>Your message:</strong></p>
          <blockquote style="border-left:3px solid #2563eb;padding-left:1em;color:#374151;">
            ${safeMessage}
          </blockquote>
          <p style="margin-top:2em;color:#6b7280;font-size:0.875em;">
            — The Sira Services Team
          </p>
        `,
      });
    } catch (err) {
      console.error("[email] Failed to send lead confirmation:", err);
    }
  },
});
