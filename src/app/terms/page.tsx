import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service",
  description: "The terms under which SIRA (Aira Development LLC) provides this website and its services.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms of" flourish="service." updated="October 2026">
      <section>
        <h2>Who we are</h2>
        <p>
          SIRA is the trading name of Aira Development LLC. This website describes our services
          and lets you get in touch. Using the site does not create a client relationship;
          engagements are agreed in writing, project by project.
        </p>
      </section>
      <section>
        <h2>Content on this site</h2>
        <p>
          Case studies describe real projects with the client&apos;s permission, and numbers are
          reported as measured on that project. Results on your project will depend on your
          data and goals, which is why every engagement starts with a scoping call.
        </p>
      </section>
      <section>
        <h2>Engagements</h2>
        <p>
          Scope, price, timeline, deliverables, and ownership of work are set out in a written
          proposal or agreement for each project. Where nothing else is agreed, you own the
          deliverables once paid for, and we keep the right to describe the work in general
          terms in our portfolio.
        </p>
      </section>
      <section>
        <h2>Liability</h2>
        <p>
          The site is provided as is. We do our best to keep it accurate and available but
          cannot promise it will be error-free. To the extent permitted by law, our liability
          arising from use of this site is limited to the amount you have paid us for the
          services in question.
        </p>
      </section>
    </LegalPage>
  );
}
