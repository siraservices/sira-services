"use node";
// Email an invoice to the customer with a link to view and pay it online.

import { ConvexError, v } from "convex/values";
import { Resend } from "resend";
import { action, internalAction, type ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { formatCents } from "./booksLib";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

type Loaded = { actor: string; inv: Doc<"booksInvoices">; contact: Doc<"booksContacts"> | null };

async function deliver(ctx: ActionCtx, loaded: Loaded, to: string, message?: string): Promise<{ link: string }> {
  const { actor, inv, contact } = loaded;
  const email = to.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ConvexError("That email address doesn't look right.");
  if (inv.status === "draft") throw new ConvexError("Mark the invoice as sent first.");
  if (inv.status === "void") throw new ConvexError("This invoice is void.");
  if (!process.env.RESEND_API_KEY) throw new ConvexError("Email isn't set up (RESEND_API_KEY is missing).");
  const token: string = await ctx.runMutation(internal.booksPublic.ensureToken, { id: inv._id });
  const site = (process.env.SITE_URL ?? "https://www.sira.services").replace(/\/$/, "");
  const link = `${site}/invoice/${token}`;
  const balance = inv.total - inv.amountPaid;
  const greeting = contact?.name ? `Hi ${esc(contact.name.split(" ")[0])},` : "Hi,";
  const note = message?.trim() ? `<p>${esc(message.trim()).replace(/\n/g, "<br>")}</p>` : "";
  const html = `<div style="font-family:Inter,Arial,sans-serif;color:#0F1419;max-width:560px">
      <p>${greeting}</p>
      ${note}
      <p>Here is invoice <b>#${esc(inv.number)}</b> from Aira Development LLC for <b>${formatCents(balance)}</b>, due ${esc(inv.dueDate)}.</p>
      <p><a href="${link}" style="display:inline-block;background:#0B4A2F;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">View${
        process.env.STRIPE_SECRET_KEY ? " and pay" : ""
      } invoice</a></p>
      <p style="color:#555;font-size:13px">Or open this link: ${link}</p>
      <p>Thank you,<br>Julio Aira<br>SIRA · sira.services</p>
    </div>`;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.RESEND_FROM_EMAIL ?? "Sira Services <noreply@siraservices.com>";
  const { error } = await resend.emails.send({
    from,
    to: email,
    replyTo: process.env.ADMIN_EMAIL ?? "aira4development@gmail.com",
    subject: `Invoice #${inv.number} from Aira Development LLC`,
    html,
  });
  if (error) throw new ConvexError(`Email failed: ${error.message}`);
  await ctx.runMutation(internal.booksPublic.markEmailed, { id: inv._id, to: email, actor });
  return { link };
}

/** From the invoice page (signed in). */
export const send = action({
  args: { id: v.id("booksInvoices"), to: v.string(), message: v.optional(v.string()) },
  handler: async (ctx, { id, to, message }): Promise<{ link: string }> => {
    const loaded: Loaded = await ctx.runQuery(internal.booksPublic.forEmail, { id });
    return await deliver(ctx, loaded, to, message);
  },
});

/** From the recurring-invoice job. */
export const sendAuto = internalAction({
  args: { id: v.id("booksInvoices") },
  handler: async (ctx, { id }): Promise<{ link: string }> => {
    const loaded: Loaded = await ctx.runQuery(internal.booksPublic.forEmailAuto, { id });
    if (!loaded.contact?.email) throw new ConvexError("The customer has no email address.");
    return await deliver(ctx, loaded, loaded.contact.email);
  },
});
