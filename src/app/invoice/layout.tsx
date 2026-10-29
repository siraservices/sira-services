import type { Metadata } from "next";

// Customer invoice links are private: keep them out of search engines.
export const metadata: Metadata = {
  title: "Invoice | Aira Development LLC",
  robots: { index: false, follow: false },
};

export default function InvoiceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
