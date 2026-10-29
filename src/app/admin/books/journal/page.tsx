"use client";

import { useMutation, useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { Plus, Trash2, Undo2 } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { btn, btnGhost, card, formatCents, input, toCents, todayIso } from "@/components/books/format";

type Row = { accountId: string; debit: string; credit: string; memo: string };
const blank = (): Row => ({ accountId: "", debit: "", credit: "", memo: "" });

function safeCents(s: string): number | null {
  try {
    return toCents(s || "0");
  } catch {
    return null;
  }
}

export default function BooksJournalPage() {
  const accounts = useQuery(api.booksAccounts.list, {});
  const [from, setFrom] = useState(`${todayIso().slice(0, 4)}-01-01`);
  const [to, setTo] = useState(todayIso());
  const entries = useQuery(api.booksLedger.listEntries, { from, to, limit: 500 });
  const post = useMutation(api.booksLedger.post);
  const reverse = useMutation(api.booksLedger.reverse);

  const [date, setDate] = useState(todayIso());
  const [memo, setMemo] = useState("");
  const [rows, setRows] = useState<Row[]>([blank(), blank()]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const names = useMemo(() => new Map((accounts ?? []).map((a) => [a._id as string, a.name])), [accounts]);
  const totals = rows.reduce(
    (t, r) => ({ d: t.d + (safeCents(r.debit) ?? 0), c: t.c + (safeCents(r.credit) ?? 0) }),
    { d: 0, c: 0 },
  );

  const setRow = (i: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const lines = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r.accountId && !r.debit && !r.credit) continue;
      const d = safeCents(r.debit);
      const c = safeCents(r.credit);
      if (!r.accountId) return setError(`Line ${i + 1}: pick an account.`);
      if (d === null || c === null) return setError(`Line ${i + 1}: amount isn't a number.`);
      lines.push({ accountId: r.accountId as Id<"booksAccounts">, debit: d, credit: c, memo: r.memo || undefined });
    }
    setSaving(true);
    try {
      await post({ date, memo: memo || undefined, lines });
      setMemo("");
      setRows([blank(), blank()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const undo = async (id: Id<"booksEntries">) => {
    if (!confirm("Post a reversing entry dated today? The original stays in the history.")) return;
    try {
      await reverse({ entryId: id, date: todayIso() });
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className={card}>
        <h2 className="font-display font-semibold text-text mb-3">New journal entry</h2>
        <div className="grid sm:grid-cols-[160px_1fr] gap-3 mb-3">
          <input type="date" className={input} value={date} onChange={(e) => setDate(e.target.value)} required />
          <input className={input} placeholder="Memo" value={memo} onChange={(e) => setMemo(e.target.value)} />
        </div>
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-[1fr_110px_110px_1fr_32px] gap-2 items-center">
              <select className={input} value={r.accountId} onChange={(e) => setRow(i, { accountId: e.target.value })}>
                <option value="">Account…</option>
                {accounts?.map((a) => (
                  <option key={a._id} value={a._id}>{a.name}</option>
                ))}
              </select>
              <input className={`${input} text-right`} placeholder="Debit" inputMode="decimal" value={r.debit}
                onChange={(e) => setRow(i, { debit: e.target.value, credit: e.target.value ? "" : r.credit })} />
              <input className={`${input} text-right`} placeholder="Credit" inputMode="decimal" value={r.credit}
                onChange={(e) => setRow(i, { credit: e.target.value, debit: e.target.value ? "" : r.debit })} />
              <input className={input} placeholder="Line memo" value={r.memo} onChange={(e) => setRow(i, { memo: e.target.value })} />
              <button type="button" aria-label="Remove line" className="text-text-muted hover:text-accent disabled:opacity-30"
                disabled={rows.length <= 2} onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
          <button type="button" className={btnGhost} onClick={() => setRows((rs) => [...rs, blank()])}>
            <Plus className="h-4 w-4" /> Line
          </button>
          <span className={`text-sm font-mono ${totals.d === totals.c && totals.d > 0 ? "text-primary" : "text-text-muted"}`}>
            Debits {formatCents(totals.d)} · Credits {formatCents(totals.c)}
          </span>
          <button className={btn} disabled={saving || totals.d !== totals.c || totals.d === 0}>Post entry</button>
        </div>
        {error && <p className="text-sm text-accent mt-2">{error}</p>}
      </form>

      <section className={card}>
        <div className="flex flex-wrap gap-3 items-center mb-3">
          <h2 className="font-display font-semibold text-text flex-1">Entries</h2>
          <input type="date" className={`${input} w-auto`} value={from} onChange={(e) => setFrom(e.target.value)} />
          <span className="text-text-muted text-sm">to</span>
          <input type="date" className={`${input} w-auto`} value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        {entries === undefined ? (
          <p className="text-sm text-text-muted">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-text-muted">No entries in this range.</p>
        ) : (
          <ul className="divide-y divide-surface-border">
            {entries.map((e) => (
              <li key={e._id} className="py-3 text-sm">
                <div className="flex gap-3 items-baseline">
                  <span className="font-mono text-text-muted w-24 shrink-0">{e.date}</span>
                  <span className="flex-1 text-text">
                    {e.txnType && <span className="text-xs font-mono text-text-muted mr-2">{e.txnType}{e.num ? ` #${e.num}` : ""}</span>}
                    {e.memo}
                    {e.reversedById && <span className="ml-2 text-xs text-accent">reversed</span>}
                    {e.reversesId && <span className="ml-2 text-xs text-accent">reversal</span>}
                  </span>
                  <span className="font-mono">{formatCents(e.total)}</span>
                  {!e.reversedById && !e.reversesId && (
                    <button title="Reverse" className="text-text-muted hover:text-accent" onClick={() => undo(e._id)}>
                      <Undo2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <ul className="ml-28 mt-1 text-xs text-text-muted space-y-0.5">
                  {e.lines.map((l) => (
                    <li key={l._id} className="flex gap-3">
                      <span className={`flex-1 ${l.credit ? "pl-6" : ""}`}>{names.get(l.accountId) ?? "?"}</span>
                      <span className="font-mono w-24 text-right">{l.debit ? formatCents(l.debit) : ""}</span>
                      <span className="font-mono w-24 text-right">{l.credit ? formatCents(l.credit) : ""}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
