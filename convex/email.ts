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

export const sendLeadNotifications = internalAction({
  args: {
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    message: v.string(),
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
    const companyLine = args.company
      ? `<p><strong>Company:</strong> ${escapeHtml(args.company)}</p>`
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
          subject: `New lead from ${safeName}`,
          html: `
            <h2>New Lead Submission</h2>
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            ${companyLine}
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
