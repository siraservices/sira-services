"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../../../convex/_generated/api";
import { btn, card, input } from "@/components/books/format";

export default function BooksAccessPage() {
  const members = useQuery(api.booksAuth.listMembers, {});
  const invite = useMutation(api.booksAuth.invite);
  const revoke = useMutation(api.booksAuth.revoke);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await invite({ email });
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="space-y-6">
      <section className={card}>
        <h2 className="font-display font-semibold text-text mb-1">Who can open Sira Books</h2>
        <p className="text-sm text-text-muted mb-4">
          Only you, unless you add someone here. They also need a site login, and their email
          must be added to BOOKS_EXTRA_EMAILS in Vercel.
        </p>
        {members === undefined ? <p className="text-sm text-text-muted">Loading…</p> : (
          <ul className="divide-y divide-surface-border">
            {members.map((m) => (
              <li key={m._id} className="flex items-center gap-3 py-2 text-sm">
                <span className="flex-1 text-text">{m.email}</span>
                <span className="text-xs font-mono text-text-muted">{m.role}</span>
                <span className="text-xs text-text-muted">{m.active ? (m.userId ? "active" : "invited") : "removed"}</span>
                {m.role !== "owner" && m.active && (
                  <button className="text-xs text-accent" onClick={() => revoke({ id: m._id })}>Remove</button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
      <form onSubmit={add} className={`${card} flex gap-3 items-end`}>
        <label className="flex-1 text-sm">
          <span className="block text-text-muted mb-1">Invite by email (e.g. your CPA)</span>
          <input className={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <button className={btn} disabled={!email}>Invite</button>
        {error && <p className="text-sm text-accent">{error}</p>}
      </form>
    </div>
  );
}
