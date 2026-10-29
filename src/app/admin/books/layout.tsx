import { withAuth } from "@workos-inc/authkit-nextjs";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BooksShell } from "@/components/books/BooksShell";
import { booksEmailAllowed } from "@/lib/books-access";

export const metadata: Metadata = {
  title: "Books",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Layer 1 (server): the signed-in WorkOS user must have a verified email on
// the Books list. Anyone else gets a plain 404, so the page doesn't even
// admit it exists. Layer 2 is the Convex check on every query and mutation
// (convex/booksAuth.ts), which is the one that actually guards the data.
export default async function BooksLayout({ children }: { children: React.ReactNode }) {
  const { user } = await withAuth({ ensureSignedIn: true });
  if (!user || !booksEmailAllowed(user.email, user.emailVerified)) notFound();
  return <BooksShell>{children}</BooksShell>;
}
