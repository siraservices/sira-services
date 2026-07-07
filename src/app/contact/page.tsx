import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description:
    "Have an AI or machine learning project in mind? Get in touch with SIRA and we'll respond within 24-48 hours to discuss how we can help.",
  path: "/contact",
});

export default function ContactPage() {
  return <ContactForm />;
}
