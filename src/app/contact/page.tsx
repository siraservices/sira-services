import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Book a Free AI Consulting Call",
  description:
    "Book a free 30-minute AI consultation about your automation, computer vision or website project, or send a message and get a reply within 24–48 hours.",
  path: "/contact",
});

export default function ContactPage() {
  return <ContactForm />;
}
