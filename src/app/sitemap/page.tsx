import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSections } from "@/lib/site-urls";

export const metadata: Metadata = {
  // Root layout applies template "%s | SIRA", so this resolves to "Sitemap | SIRA".
  title: "Sitemap",
  description:
    "Browse every public page on sira.services — company info, AI and ML services, blog articles, and case studies — in one human-readable index.",
  alternates: { canonical: "/sitemap" },
  robots: { index: true, follow: true },
};

export const revalidate = 3600;

export default async function SitemapPage() {
  const sections = await getSiteSections();

  return (
    <div className="py-16 px-4 bg-surface">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-text mb-4">Sitemap</h1>
        <p className="text-xl text-text-muted mb-12">
          A complete, human-readable index of every public page on sira.services.
        </p>

        <div className="space-y-12">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-2xl font-bold text-text mb-4">{section.title}</h2>
              <ul className="space-y-2">
                {section.urls.map((entry) => (
                  <li key={entry.path}>
                    <Link
                      href={entry.path}
                      className="text-primary font-medium hover:text-primary-light transition-colors duration-200"
                    >
                      {entry.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
