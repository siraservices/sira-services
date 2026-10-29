"use client";

import { useAction, useQuery } from "convex/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { api } from "../../../convex/_generated/api";

const NAV = [
  { href: "/admin/books", label: "Overview" },
  { href: "/admin/books/journal", label: "Journal" },
  { href: "/admin/books/accounts", label: "Accounts" },
  { href: "/admin/books/reports", label: "Reports" },
  { href: "/admin/books/import", label: "Import" },
  { href: "/admin/books/access", label: "Access" },
];

/**
 * Client gate. Asks Convex to bind this WorkOS user to their Books membership
 * (server-side check against WorkOS), then renders nothing but a lock screen
 * unless Convex says the caller is allowed.
 */
export function BooksShell({ children }: { children: React.ReactNode }) {
  const access = useQuery(api.booksAuth.access, {});
  const bindSelf = useAction(api.booksAuth.bindSelf);
  const [binding, setBinding] = useState(false);
  const [bindError, setBindError] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (access && access.signedIn && !access.allowed && !binding && !bindError) {
      setBinding(true);
      bindSelf({})
        .then((r) => {
          if (!r.allowed) setBindError("This account doesn't have access to Sira Books.");
        })
        .catch((e) => setBindError(e instanceof Error ? e.message : String(e)))
        .finally(() => setBinding(false));
    }
  }, [access, binding, bindError, bindSelf]);

  if (access === undefined || binding || (access.signedIn && !access.allowed && !bindError)) {
    return (
      <div className="pt-32 pb-20 px-6 flex items-center gap-3 justify-center text-text-muted">
        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        Checking access…
      </div>
    );
  }

  if (!access.allowed) {
    return (
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-md mx-auto text-center">
          <Lock className="h-6 w-6 mx-auto text-text-muted mb-3" />
          <h1 className="text-xl font-display font-semibold text-text mb-2">No access</h1>
          <p className="text-sm text-text-muted">
            {bindError ?? "Sign in with the account that owns these books."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-display font-bold text-text">Sira Books</h1>
          <nav className="flex flex-wrap gap-1">
            {NAV.map((n) => {
              const active = n.href === "/admin/books" ? pathname === n.href : pathname.startsWith(n.href);
              if (n.href === "/admin/books/access" && access.role !== "owner") return null;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-display ${
                    active ? "bg-primary text-white" : "text-text-muted hover:text-text hover:bg-surface-hover"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
        {children}
      </div>
    </div>
  );
}
