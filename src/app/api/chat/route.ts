import { NextResponse } from "next/server";
import { services } from "@/lib/services";
import { BOOKING_URL, CONTACT_EMAIL } from "@/lib/seo";

// Sira website assistant. Uses Claude when ANTHROPIC_API_KEY is set; the widget
// (public/sira-chat.js) falls back to a built-in FAQ when this returns an error.

export const runtime = "nodejs";

const MODEL = process.env.CHAT_MODEL || "claude-haiku-5-5";

const serviceList = services
  .map((s) => `- ${s.title}: ${s.shortDescription} (${s.features.join("; ")}). Page: /services/${s.slug}`)
  .join("\n");

const SYSTEM = `You are the website assistant for SIRA (sira.services), an applied AI, machine learning and web studio run by founder Julio Aira.

What SIRA does:
${serviceList}

Facts you may use (never invent prices, timelines, client names, results or guarantees):
- Case studies live at /case-studies (AI/CV projects and small-business websites).
- Book a free intro call: ${BOOKING_URL}
- Email: ${CONTACT_EMAIL}. Contact form: /contact
- Pricing is scoped per project after a short call.

How to behave:
- Friendly, concise (1 to 3 sentences), plain English, no em dashes, no hype.
- Figure out what the visitor needs, point them to the most relevant service page, and invite them to book a call or leave their email.
- If they share an email or phone, thank them and say Julio will follow up.
- If asked something you don't know, say so and offer the call or email.
- Stay on topic: SIRA's services, AI, ML, automation and websites.`;

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ error: "no_key" }, { status: 503 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const raw = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(raw)) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const messages: Msg[] = raw
    .filter(
      (m): m is Msg =>
        !!m &&
        typeof m === "object" &&
        ((m as Msg).role === "user" || (m as Msg).role === "assistant") &&
        typeof (m as Msg).content === "string",
    )
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 800) }));
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model: MODEL, max_tokens: 300, system: SYSTEM, messages }),
    });
    if (!r.ok) {
      console.error("Anthropic error", r.status, await r.text());
      return NextResponse.json({ error: "upstream" }, { status: 502 });
    }
    const data = (await r.json()) as { content?: { type: string; text?: string }[] };
    const reply = (data.content ?? [])
      .filter((b) => b.type === "text")
      .map((b) => b.text ?? "")
      .join("")
      .trim();
    return NextResponse.json({ reply: reply || "Sorry, could you rephrase that?" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
