"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../../../convex/_generated/api";
import { btn, card, input } from "@/components/books/format";
import { errorText } from "@/components/books/pickers";

const KINDS = ["customer", "vendor", "contractor", "other"] as const;

export default function BooksContactsPage() {
  const contacts = useQuery(api.booksContacts.list, { includeInactive: true });
  const create = useMutation(api.booksContacts.create);
  const update = useMutation(api.booksContacts.update);
  const [form, setForm] = useState({ name: "", company: "", email: "", address: "", kind: "customer" as (typeof KINDS)[number] });
  const [error, setError] = useState<string | null>(null);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await create({
        name: form.name,
        kind: form.kind,
        company: form.company || undefined,
        email: form.email || undefined,
        address: form.address || undefined,
      });
      setForm({ ...form, name: "", company: "", email: "", address: "" });
    } catch (err) {
      setError(errorText(err));
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={add} className={`${card} grid sm:grid-cols-2 gap-3`}>
        <h2 className="sm:col-span-2 font-display font-semibold text-text">New contact</h2>
        <input className={input} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className={input} placeholder="Company (optional)" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
        <input className={input} type="email" placeholder="Email (for invoices)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <select className={input} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as typeof form.kind })}>
          {KINDS.map((k) => (
            <option key={k} value={k}>{k[0].toUpperCase() + k.slice(1)}</option>
          ))}
        </select>
        <textarea className={`${input} sm:col-span-2`} rows={2} placeholder="Billing address (shown on invoices)" value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <div className="sm:col-span-2 flex items-center gap-3">
          <button className={btn} disabled={!form.name.trim()}>Add contact</button>
          {error && <p className="text-sm text-accent">{error}</p>}
        </div>
      </form>

      <section className={card}>
        <h2 className="font-display font-semibold text-text mb-2">Contacts</h2>
        {contacts === undefined ? <p className="text-sm text-text-muted">Loading…</p> : contacts.length === 0 ? (
          <p className="text-sm text-text-muted">No contacts yet.</p>
        ) : (
          <ul className="divide-y divide-surface-border">
            {contacts.map((c) => (
              <li key={c._id} className="flex flex-wrap items-center gap-3 py-2 text-sm">
                <span className={`flex-1 ${c.active ? "text-text" : "text-text-dim line-through"}`}>
                  {c.name}
                  {c.company && <span className="text-text-muted"> · {c.company}</span>}
                  {c.email && <span className="text-text-muted"> · {c.email}</span>}
                </span>
                <span className="text-xs font-mono text-text-muted">{c.kind}</span>
                <button className="text-xs text-text-muted hover:text-text" onClick={() => update({ id: c._id, active: !c.active })}>
                  {c.active ? "Hide" : "Show"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
