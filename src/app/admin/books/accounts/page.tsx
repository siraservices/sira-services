"use client";

import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useState } from "react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { TYPE_LABEL, btn, btnGhost, card, input } from "@/components/books/format";

const TYPES = ["asset", "liability", "equity", "income", "expense"] as const;

export default function BooksAccountsPage() {
  const [showInactive, setShowInactive] = useState(false);
  const accounts = useQuery(api.booksAccounts.list, { includeInactive: showInactive });
  const create = useMutation(api.booksAccounts.create);
  const update = useMutation(api.booksAccounts.update);
  const seed = useMutation(api.booksAccounts.seedStarterChart);
  const [name, setName] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("expense");
  const [error, setError] = useState<string | null>(null);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await create({ name, type });
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  if (accounts === undefined) return <p className="text-text-muted">Loading…</p>;

  return (
    <div className="space-y-6">
      <form onSubmit={add} className={`${card} flex flex-wrap gap-3 items-end`}>
        <label className="flex-1 min-w-[220px] text-sm">
          <span className="block text-text-muted mb-1">New account</span>
          <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Contract labor" />
        </label>
        <label className="text-sm">
          <span className="block text-text-muted mb-1">Type</span>
          <select className={input} value={type} onChange={(e) => setType(e.target.value as typeof type)}>
            {TYPES.map((t) => (
              <option key={t} value={t}>{TYPE_LABEL[t]}</option>
            ))}
          </select>
        </label>
        <button className={btn} disabled={!name.trim()}>Add</button>
        {accounts.length === 0 && (
          <button type="button" className={btnGhost} onClick={() => seed({})}>
            Use starter chart
          </button>
        )}
        {error && <p className="w-full text-sm text-accent">{error}</p>}
      </form>

      <label className="flex items-center gap-2 text-sm text-text-muted">
        <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
        Show inactive accounts
      </label>

      {TYPES.map((t) => {
        const rows = accounts.filter((a) => a.type === t);
        if (rows.length === 0) return null;
        return (
          <section key={t} className={card}>
            <h2 className="font-display font-semibold text-text mb-2">{TYPE_LABEL[t]}</h2>
            <ul className="divide-y divide-surface-border">
              {rows.map((a) => (
                <li key={a._id} className="flex items-center gap-3 py-2 text-sm">
                  <Link
                    href={`/admin/books/accounts/${a._id}`}
                    className={`flex-1 hover:text-primary ${a.active ? "text-text" : "text-text-dim line-through"}`}
                  >
                    {a.name}
                  </Link>
                  {(t === "asset" || t === "liability") && (
                    <label className="flex items-center gap-1 text-xs text-text-muted">
                      <input
                        type="checkbox"
                        checked={!!a.isCash}
                        onChange={(e) => update({ id: a._id as Id<"booksAccounts">, isCash: e.target.checked })}
                      />
                      cash
                    </label>
                  )}
                  <button
                    className="text-xs text-text-muted hover:text-text"
                    onClick={() => update({ id: a._id as Id<"booksAccounts">, active: !a.active })}
                  >
                    {a.active ? "Make inactive" : "Reactivate"}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
