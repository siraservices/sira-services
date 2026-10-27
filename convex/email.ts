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
    const fromAddress = process.env.RESEND_FROM_EMAIL ?? "Sira Services <noreply@siraservices.com>";
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
          from: fromAddress,
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
        from: fromAddress,
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

const WANTS_LABEL: Record<string, string> = {
  diy: "Just the toolkit (DIY)",
  install: "Install it for my team",
  "done-for-you": "Make the clips for me (done-for-you)",
};

/** Sira Clips lead magnet: download link to the lead + notification to admin. */
export const sendToolkitEmails = internalAction({
  args: {
    name: v.string(),
    email: v.string(),
    token: v.string(),
    company: v.optional(v.string()),
    decisionRole: v.optional(v.string()),
    teamSize: v.optional(v.string()),
    videoVolume: v.optional(v.string()),
    wantsInstall: v.optional(v.string()),
    isRepeat: v.boolean(),
  },
  handler: async (_ctx, args) => {
    if (!process.env.RESEND_API_KEY) {
      console.error("[email] RESEND_API_KEY not set — skipping toolkit email");
      return;
    }
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromAddress = process.env.RESEND_FROM_EMAIL ?? "Sira Services <noreply@siraservices.com>";
    const siteUrl = (process.env.SITE_URL ?? "https://www.sira.services").replace(/\/$/, "");
    const bookingUrl = process.env.BOOKING_URL ?? "https://calendly.com/airadev/work";
    const downloadUrl = `${siteUrl}/api/clips/download?t=${encodeURIComponent(args.token)}`;
    const firstName = escapeHtml(args.name.split(" ")[0] || args.name);
    const wants = args.wantsInstall ? WANTS_LABEL[args.wantsInstall] ?? args.wantsInstall : undefined;
    const wantsHelp = args.wantsInstall === "install" || args.wantsInstall === "done-for-you";

    const btnStyle =
      "display:inline-block;padding:14px 26px;border-radius:999px;background:#0B4A2F;color:#ffffff;font-weight:600;text-decoration:none;font-family:Arial,sans-serif;";
    const helpBlock = wantsHelp
      ? `<div style="margin:28px 0;padding:20px;border-radius:16px;background:#F3F1EA;">
           <p style="margin:0 0 8px;font-weight:600;">You said you'd like us to ${args.wantsInstall === "install" ? "install it for your team" : "make the clips for you"}.</p>
           <p style="margin:0 0 14px;">Grab a 30-minute call and we'll scope it around your videos and brand.</p>
           <a href="${bookingUrl}" style="${btnStyle}background:#C2410C;">Book your call</a>
         </div>`
      : `<p style="margin:24px 0 0;">Rather not set it up yourself? We install it, build your brand kit and train your team, or we make the clips for you every month. <a href="${bookingUrl}" style="color:#0B4A2F;font-weight:600;">Book a 30-minute call</a>.</p>`;

    try {
      await resend.emails.send({
        from: fromAddress,
        to: args.email,
        replyTo: process.env.ADMIN_EMAIL || undefined,
        subject: "Your Sira Clips toolkit (download inside)",
        html: `
<div style="max-width:560px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#0F1419;line-height:1.6;font-size:15px;">
  <p>Hi ${firstName},</p>
  <p>Here's your copy of <strong>Sira Clips</strong>, the Windows toolkit that turns one long video into vertical, captioned, on-brand short clips with Claude.</p>
  <p style="margin:28px 0;"><a href="${downloadUrl}" style="${btnStyle}">Download the toolkit (.zip)</a></p>
  <p style="margin:0 0 6px;"><strong>Get your first clips in 3 steps</strong></p>
  <ol style="margin:0 0 16px;padding-left:20px;">
    <li>Unzip to a folder like <code>C:\\sira-clips</code> and run <code>scripts\\setup.ps1</code> (about 10 minutes).</li>
    <li>Drop a long video into the <code>inbox</code> folder.</li>
    <li>Open Claude Code in that folder and ask for what you want: <em>"Make 5 clips about pricing, 30–45 seconds."</em></li>
  </ol>
  <p style="margin:0;color:#4B5563;font-size:13px;">You'll need a Windows 10/11 PC (NVIDIA GPU recommended) and a paid Claude plan. Full instructions are in README.md inside the zip.</p>
  ${helpBlock}
  <p style="margin-top:28px;">If you get stuck, just reply to this email.</p>
  <p>Julio Aira<br/>Sira · <a href="${siteUrl}" style="color:#0B4A2F;">sira.services</a></p>
</div>`,
      });
    } catch (err) {
      console.error("[email] Failed to send toolkit email:", err);
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return;
    const tag = wantsHelp ? "HOT" : "toolkit";
    const row = (label: string, value?: string) =>
      value ? `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>` : "";
    try {
      await resend.emails.send({
        from: fromAddress,
        to: adminEmail,
        subject: `[${tag}] Sira Clips ${args.isRepeat ? "re-request" : "download"}: ${args.name}${args.company ? ` (${args.company})` : ""}`,
        html: `
          <h2>Sira Clips toolkit request${wantsHelp ? ' <span style="display:inline-block;padding:2px 10px;border-radius:12px;background:#C2410C;color:#fff;font-size:0.8em;">wants help</span>' : ""}</h2>
          ${row("Name", args.name)}
          ${row("Email", args.email)}
          ${row("Business", args.company)}
          ${row("Role", args.decisionRole)}
          ${row("Team size", args.teamSize)}
          ${row("Long videos / month", args.videoVolume)}
          ${row("Wants", wants)}
          <p style="color:#6b7280;font-size:0.875em;">See all leads in /admin/leads (source: clips-toolkit).</p>
        `,
      });
    } catch (err) {
      console.error("[email] Failed to send toolkit admin notification:", err);
    }
  },
});
