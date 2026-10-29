"use client";

import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../../../convex/_generated/api";
import { card, formatCents, input, todayIso } from "@/components/books/format";

type Row = { id: string; name: string; balance: number };

function Section({ title, rows, total }: { title: string; rows: Row[]; total: number }) {
  return (
    <div className="mb-4">
      <h3 className="text-xs font-mono uppercase tracking-wide text-text-muted mb-1">{title}</h3>
      <ul>
        {rows.map((r) => (
          <li key={r.id} className="flex justify-between py-1 text-sm">
            <span className="text-text">{r.name}</span>
            <span className="font-mono">{formatCents(r.balance)}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between py-1 text-sm font-semibold border-t border-surface-border mt-1">
        <span>Total {title.toLowerCase()}</span>
        <span className="font-mono">{formatCents(total)}</span>
      </div>
    </div>
  );
}

export default function BooksReportsPage() {
  const today = todayIso();
  const [from, setFrom] = useState(`${today.slice(0, 4)}-01-01`);
  const [to, setTo] = useState(today);
  const pl = useQuery(api.booksReports.profitAndLossReport, { from, to });
  const bs = useQuery(api.booksReports.balanceSheetReport, { asOf: to });
  const tb = useQuery(api.booksReports.trialBalanceReport, { asOf: to });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-center">
        <input type="date" className={`${input} w-auto`} value={from} onChange={(e) => setFrom(e.target.value)} />
        <span className="text-text-muted text-sm">to</span>
        <input type="date" className={`${input} w-auto`} value={to} onChange={(e) => setTo(e.target.value)} />
        {[0, 1, 2, 3].map((n) => {
          const y = Number(today.slice(0, 4)) - n;
          return (
            <button key={y} className="text-sm text-primary" onClick={() => { setFrom(`${y}-01-01`); setTo(n === 0 ? today : `${y}-12-31`); }}>
              {y}
            </button>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <section className={card}>
          <h2 className="font-display font-semibold text-text mb-1">Profit &amp; loss</h2>
          <p className="text-xs text-text-muted mb-4">{from} to {to}</p>
          {pl === undefined ? <p className="text-sm text-text-muted">Loading…</p> : (
            <>
              <Section title="Income" rows={pl.income} total={pl.totalIncome} />
              <Section title="Expenses" rows={pl.expenses} total={pl.totalExpenses} />
              <div className="flex justify-between pt-2 border-t-2 border-text text-sm font-bold">
                <span>Net income</span>
                <span className="font-mono">{formatCents(pl.netIncome)}</span>
              </div>
            </>
          )}
        </section>

        <section className={card}>
          <h2 className="font-display font-semibold text-text mb-1">Balance sheet</h2>
          <p className="text-xs text-text-muted mb-4">As of {to}</p>
          {bs === undefined ? <p className="text-sm text-text-muted">Loading…</p> : (
            <>
              <Section title="Assets" rows={bs.assets} total={bs.totalAssets} />
              <Section title="Liabilities" rows={bs.liabilities} total={bs.totalLiabilities} />
              <Section
                title="Equity"
                rows={[...bs.equity, { id: "ni", name: "Net income to date", balance: bs.netIncomeToDate }]}
                total={bs.totalEquity}
              />
              <p className={`text-xs mt-2 ${bs.balanced ? "text-primary" : "text-accent"}`}>
                {bs.balanced ? "Balanced: assets = liabilities + equity." : "Not balanced. Check the trial balance."}
              </p>
            </>
          )}
        </section>
      </div>

      <section className={card}>
        <h2 className="font-display font-semibold text-text mb-3">Trial balance as of {to}</h2>
        {tb === undefined ? <p className="text-sm text-text-muted">Loading…</p> : (
          <table className="w-full text-sm">
            <tbody>
              {tb.rows.map((r) => {
                const net = r.debit - r.credit;
                return (
                  <tr key={r.id} className="border-b border-surface-border">
                    <td className="py-1 text-text">{r.name}</td>
                    <td className="py-1 font-mono text-right">{net > 0 ? formatCents(net) : ""}</td>
                    <td className="py-1 font-mono text-right">{net < 0 ? formatCents(-net) : ""}</td>
                  </tr>
                );
              })}
              <tr className="font-semibold">
                <td className="py-2">Total</td>
                <td className="py-2 font-mono text-right">{formatCents(tb.debit)}</td>
                <td className="py-2 font-mono text-right">{formatCents(tb.credit)}</td>
              </tr>
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
