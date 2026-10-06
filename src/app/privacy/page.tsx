import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: "How SIRA (Aira Development LLC) handles the information you share through sira.services.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy" flourish="policy." updated="October 2026">
      <section>
        <h2>What we collect</h2>
        <p>
          When you book a call, send a message, or answer the project-fit questions on this
          site, we receive what you type: your name, email address, and the details of your
          project. The site also uses Google Analytics to understand which pages are visited;
          that data is aggregated and does not identify you to us.
        </p>
      </section>
      <section>
        <h2>How we use it</h2>
        <p>
          To reply to you, to scope and deliver work you ask for, and to keep a record of the
          conversation. We do not sell your information, add you to a newsletter, or share it
          with anyone outside SIRA except the services that run this site (hosting, form
          storage, scheduling, and email).
        </p>
      </section>
      <section>
        <h2>Where it lives</h2>
        <p>
          Form submissions are stored in our site database (Convex). Call bookings are handled
          by Calendly. Email is handled by our email provider. Each of those providers has its
          own privacy policy.
        </p>
      </section>
      <section>
        <h2>Your choices</h2>
        <p>
          You can ask us to show you, correct, or delete what we hold about you at any time by
          emailing us. We will do so within a reasonable time.
        </p>
      </section>
    </LegalPage>
  );
}
