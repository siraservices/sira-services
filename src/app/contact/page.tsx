import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Book a Free AI Consultation",
  description:
    "Book a free 30-minute call about your AI, machine learning, or computer vision project, or send a message and get a reply within 24–48 hours.",
  path: "/contact",
});

export default function ContactPage() {
  return <ContactForm />;
}
