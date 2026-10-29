// Online card/ACH payment for invoices through Stripe Checkout. Off until
// STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are set on the Convex deployment.

import { ConvexError, v } from "convex/values";
import { action, httpAction, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

const STRIPE = "https://api.stripe.com/v1";

async function stripe(path: string, init: { method?: string; form?: Record<string, string> } = {}) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new ConvexError("Online payment isn't set up yet.");
  const res = await fetch(`${STRIPE}${path}`, {
    method: init.method ?? (init.form ? "POST" : "GET"),
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: init.form ? new URLSearchParams(init.form).toString() : undefined,
  });
  const body = await res.json();
  if (!res.ok) throw new ConvexError(`Stripe: ${body?.error?.message ?? res.status}`);
  return body;
}

/** Public: the customer clicked "Pay" on /invoice/<token>. Returns the Stripe Checkout URL. */
export const checkout = action({
  args: { token: v.string() },
  handler: async (ctx, { token }): Promise<string> => {
    const inv = await ctx.runQuery(internal.booksPublic.forCheckout, { token });
    if (!inv) throw new ConvexError("This invoice can't be paid online.");
    if (inv.balance < 50) throw new ConvexError("Nothing left to pay.");
    const site = (process.env.SITE_URL ?? "https://www.sira.services").replace(/\/$/, "");
    const form: Record<string, string> = {
      mode: "payment",
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][unit_amount]": String(inv.balance),
      "line_items[0][price_data][product_data][name]": `Invoice #${inv.number} – Aira Development LLC`,
      "metadata[invoiceId]": inv.id,
      "payment_intent_data[metadata][invoiceId]": inv.id,
      "payment_intent_data[description]": `Invoice #${inv.number}`,
      success_url: `${site}/invoice/${token}?paid=1`,
      cancel_url: `${site}/invoice/${token}`,
    };
    if (inv.email) form.customer_email = inv.email;
    // Reuse the session from an earlier click if it's still open for the same amount;
    // otherwise expire it so the customer can't pay twice.
    if (inv.sessionId) {
      try {
        const old = await stripe(`/checkout/sessions/${inv.sessionId}`);
        if (old.status === "open" && old.amount_total === inv.balance && old.url) return old.url as string;
        if (old.status === "open") await stripe(`/checkout/sessions/${inv.sessionId}/expire`, { form: {} });
      } catch {
        // already expired or gone; make a new one
      }
    }
    const session = await stripe("/checkout/sessions", { form });
    await ctx.runMutation(internal.booksPublic.setCheckoutSession, { id: inv.id, sessionId: session.id });
    return session.url as string;
  },
});

/** Verify Stripe's signature header (v1 = HMAC-SHA256 of "<t>.<body>"). */
export async function verifyStripeSignature(body: string, header: string | null, secret: string, nowSec: number) {
  if (!header) return false;
  const t = Number(header.split(",").find((p) => p.startsWith("t="))?.slice(2));
  const sigs = header.split(",").filter((p) => p.startsWith("v1=")).map((p) => p.slice(3));
  if (!t || sigs.length === 0 || Math.abs(nowSec - t) > 300) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${t}.${body}`)));
  const hex = Array.from(mac, (b) => b.toString(16).padStart(2, "0")).join("");
  const same = (a: string) => {
    if (a.length !== hex.length) return false;
    let d = 0;
    for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ hex.charCodeAt(i);
    return d === 0;
  };
  return sigs.some(same);
}

export const webhook = httpAction(async (ctx, req) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return new Response("not configured", { status: 503 });
  const body = await req.text();
  if (!(await verifyStripeSignature(body, req.headers.get("stripe-signature"), secret, Math.floor(Date.now() / 1000)))) {
    return new Response("bad signature", { status: 400 });
  }
  const event = JSON.parse(body);
  if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_succeeded") {
    return new Response("ignored", { status: 200 });
  }
  const s = event.data.object;
  if (s.payment_status !== "paid" || !s.metadata?.invoiceId) return new Response("not paid", { status: 200 });
  // Stripe's fee comes from the charge's balance transaction.
  let fee = 0;
  try {
    const pi = await stripe(`/payment_intents/${s.payment_intent}?expand[]=latest_charge.balance_transaction`);
    fee = pi?.latest_charge?.balance_transaction?.fee ?? 0;
  } catch {
    fee = 0; // recorded gross; the payout match will show the difference
  }
  const date = new Date((s.created ?? event.created) * 1000).toISOString().slice(0, 10);
  const r = await ctx.runMutation(internal.booksPublic.recordStripePayment, {
    invoiceId: s.metadata.invoiceId,
    sessionId: s.id,
    amount: s.amount_total,
    fee,
    date,
  });
  return new Response(JSON.stringify(r), { status: 200, headers: { "Content-Type": "application/json" } });
});

/** After a manual payment or void: close the customer's open Checkout session, if any. */
export const expireCheckout = internalAction({
  args: { sessionId: v.string() },
  handler: async (_ctx, { sessionId }) => {
    if (!process.env.STRIPE_SECRET_KEY) return;
    try {
      await stripe(`/checkout/sessions/${sessionId}/expire`, { form: {} });
    } catch {
      // not open anymore
    }
  },
});
