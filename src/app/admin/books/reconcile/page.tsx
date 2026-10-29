"use client";

import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { btn, btnGhost, card, formatCents, input, toCents } from "@/components/books/format";
import { errorText } from "@/components/books/pickers";

export default function BooksReconcilePage() {
  const accounts = useQuery(api.booksAccounts.list, {});
  const cash = (accounts ?? []).filter((a) => a.isCash && (a.type === "asset" || a.type === "liability"));
  const [accountId, setAccountId] = useState("");
  useEffect(() => {
    if (!accountId && cash.length) setAccountId(cash.find((a) => a.name.includes("Checking"))?._id ?? cash[0]._id);
  }, [accountId, cash]);
  const acct = cash.find((a) => a._id === accountId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {cash.map((a) => (
          <button key={a._id} onClick={() => setAccountId(a._id)}
            className={`px-3 py-1.5 rounded-lg text-sm border ${accountId === a._id ? "bg-primary text-white border-primary" : "border-surface-border text-text"}`}>
            {a.name}
          </button>
        ))}
      </div>
      {acct && <Reconcile key={acct._id} accountId={acct._id as Id<"booksAccounts">} isCard={acct.type === "liability"} />}
    </div>
  );
}

function Reconcile({ accountId, isCard }: { accountId: Id<"booksAccounts">; isCard: boolean }) {
  const cur = useQuery(api.booksReconcile.current, { accountId });
  const history = useQuery(api.booksReconcile.list, { accountId });
  const reopen = useMutation(api.booksReconcile.reopen);
  const [error, setError] = useState<string | null>(null);

  if (cur === undefined || history === undefined) return <p className="text-sm text-text-muted">Loading…</p>;
  const done = history.filter((h) => h.status === "done");

  return (
    <>
      {cur ? <Worksheet data={cur} isCard={isCard} /> : <StartForm accountId={accountId} isCard={isCard} last={done[0]} />}
      <section className={card}>
        <h2 className="font-display font-semibold text-text mb-3">Reconciled statements</h2>
        {error && <p className="text-sm text-accent mb-2">{error}</p>}
        {done.length === 0 ? (
          <p className="text-sm text-text-muted">None yet.</p>
        ) : (
          <ul className="divide-y divide-surface-border text-sm">
            {done.map((h, i) => (
              <li key={h._id} className="flex items-center gap-3 py-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="font-mono w-28">{h.statementDate}</span>
                <span className="flex-1 font-mono">{formatCents(h.statementBalance)}{isCard ? " owed" : ""}</span>
                {i === 0 && !cur && (
                  <button className="text-xs text-text-muted hover:text-text" onClick={async () => {
                    setError(null);
                    try { await reopen({ recId: h._id }); } catch (err) { setError(errorText(err)); }
                  }}>Reopen</button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function StartForm({ accountId, isCard, last }: { accountId: Id<"booksAccounts">; isCard: boolean; last?: { statementDate: string; statementBalance: number } }) {
  const start = useMutation(api.booksReconcile.start);
  const [date, setDate] = useState("");
  const [bal, setBal] = useState("");
  const [error, setError] = useState<string | null>(null);
  return (
    <form className={`${card} space-y-3`} onSubmit={async (e) => {
      e.preventDefault();
      setError(null);
      try {
        await start({ accountId, statementDate: date, statementBalance: toCents(bal) });
      } catch (err) {
        setError(errorText(err));
      }
    }}>
      <h2 className="font-display font-semibold text-text">Reconcile a statement</h2>
      <p className="text-sm text-text-muted">
        {last ? `Last reconciled through ${last.statementDate} at ${formatCents(last.statementBalance)}. ` : "First reconciliation: it starts from $0.00. "}
        Enter the next statement’s closing date and {isCard ? "new balance (what you owe)" : "ending balance"}.
      </p>
      <div className="flex flex-wrap gap-3 items-end">
        <label className="text-sm">
          <span className="block text-text-muted mb-1">Statement ending date</span>
          <input type="date" className={`${input} w-44`} value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="text-sm">
          <span className="block text-text-muted mb-1">{isCard ? "New balance" : "Ending balance"}</span>
          <input className={`${input} w-36 text-right`} inputMode="decimal" placeholder="0.00" value={bal} onChange={(e) => setBal(e.target.value)} />
        </label>
        <button className={btn} disabled={!date || !bal.trim()}>Start</button>
      </div>
      {error && <p className="text-sm text-accent">{error}</p>}
    </form>
  );
}

type Row = { lineId: Id<"booksLines">; date: string; memo: string; txnType?: string; amount: number; cleared: boolean };
type Cur = {
  rec: { _id: Id<"booksRecs">; statementDate: string; statementBalance: number; beginningBalance: number };
  rows: Row[];
  cleared: number;
  difference: number;
};

function Worksheet({ data, isCard }: { data: Cur; isCard: boolean }) {
  const setCleared = useMutation(api.booksReconcile.setCleared);
  const finish = useMutation(api.booksReconcile.finish);
  const cancel = useMutation(api.booksReconcile.cancel);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { rec, rows, cleared, difference } = data;
  const up = isCard ? "Charges" : "Deposits";
  const down = isCard ? "Payments & credits" : "Withdrawals";
  const ups = useMemo(() => rows.filter((r) => r.amount > 0), [rows]);
  const downs = useMemo(() => rows.filter((r) => r.amount < 0), [rows]);

  const act = async (fn: () => Promise<unknown>) => {
    setError(null);
    setBusy(true);
    try { await fn(); } catch (err) { setError(errorText(err)); } finally { setBusy(false); }
  };
  const toggle = (ids: Id<"booksLines">[], on: boolean) => act(async () => {
    for (let i = 0; i < ids.length; i += 500) await setCleared({ recId: rec._id, lineIds: ids.slice(i, i + 500), cleared: on });
  });

  return (
    <section className={`${card} space-y-4`}>
      <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2">
        <h2 className="font-display font-semibold text-text">Statement ending {rec.statementDate}</h2>
        <Stat label="Beginning" value={rec.beginningBalance} />
        <Stat label="Statement" value={rec.statementBalance} />
        <Stat label="Cleared" value={cleared} />
        <Stat label="Difference" value={difference} strong={difference !== 0} />
      </div>
      <div className="flex flex-wrap gap-2">
        <button className={btnGhost} disabled={busy} onClick={() => toggle(rows.filter((r) => !r.cleared).map((r) => r.lineId), true)}>
          Check all through {rec.statementDate}
        </button>
        <button className={btnGhost} disabled={busy} onClick={() => toggle(rows.filter((r) => r.cleared).map((r) => r.lineId), false)}>
          Uncheck all
        </button>
        <span className="flex-1" />
        <button className={btnGhost} disabled={busy} onClick={() => act(() => cancel({ recId: rec._id }))}>Cancel</button>
        <button className={btn} disabled={busy || difference !== 0} onClick={() => act(() => finish({ recId: rec._id }))}>
          Finish
        </button>
      </div>
      {error && <p className="text-sm text-accent">{error}</p>}
      <div className="grid md:grid-cols-2 gap-6">
        <Column title={up} rows={ups} onToggle={(r) => toggle([r.lineId], !r.cleared)} busy={busy} />
        <Column title={down} rows={downs} onToggle={(r) => toggle([r.lineId], !r.cleared)} busy={busy} />
      </div>
    </section>
  );
}

function Stat({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <span className="text-sm">
      <span className="text-text-muted mr-2">{label}</span>
      <span className={`font-mono ${strong ? "text-accent font-semibold" : "text-text"}`}>{formatCents(value)}</span>
    </span>
  );
}

function Column({ title, rows, onToggle, busy }: { title: string; rows: Row[]; onToggle: (r: Row) => void; busy: boolean }) {
  const total = rows.filter((r) => r.cleared).reduce((s, r) => s + Math.abs(r.amount), 0);
  return (
    <div>
      <h3 className="text-sm font-semibold text-text mb-2">
        {title} <span className="text-text-muted font-normal">· {rows.filter((r) => r.cleared).length} of {rows.length} checked · {formatCents(total)}</span>
      </h3>
      {rows.length === 0 ? <p className="text-sm text-text-muted">None.</p> : (
        <ul className="divide-y divide-surface-border text-sm max-h-[480px] overflow-auto">
          {rows.map((r) => (
            <li key={r.lineId}>
              <label className="flex items-center gap-3 py-1.5 cursor-pointer">
                <input type="checkbox" checked={r.cleared} disabled={busy} onChange={() => onToggle(r)} />
                <span className="font-mono text-text-muted w-24">{r.date}</span>
                <span className="flex-1 truncate" title={r.memo}>{r.memo || r.txnType}</span>
                <span className="font-mono">{formatCents(Math.abs(r.amount))}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
