"use client";

import { useConvex, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../../../convex/_generated/api";
import { Download } from "lucide-react";
import { btnGhost, card, formatCents, input, todayIso } from "@/components/books/format";
import { centsToPlain, downloadText, toCsv } from "@/components/books/download";

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

      <Downloads from={from} to={to} pl={pl} bs={bs} tb={tb} />

      <ByMonth year={Number(to.slice(0, 4))} />

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

type Pl = ReturnType<typeof useQuery<typeof api.booksReports.profitAndLossReport>>;
type Bs = ReturnType<typeof useQuery<typeof api.booksReports.balanceSheetReport>>;
type Tb = ReturnType<typeof useQuery<typeof api.booksReports.trialBalanceReport>>;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function Downloads({ from, to, pl, bs, tb }: { from: string; to: string; pl: Pl; bs: Bs; tb: Tb }) {
  const convex = useConvex();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const year = Number(to.slice(0, 4));
  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    setMsg(null);
    try {
      await fn();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  };
  const tag = `${from}_to_${to}`;
  const items: { key: string; label: string; go: () => Promise<void> }[] = [
    {
      key: "pl", label: "Profit & loss", go: async () => {
        if (!pl) return;
        downloadText(`sira-books-profit-and-loss_${tag}.csv`, toCsv([
          ["Profit and loss", `${from} to ${to}`], [], ["Account", "Amount"],
          ["Income"], ...pl.income.map((r) => [r.name, centsToPlain(r.balance)]), ["Total income", centsToPlain(pl.totalIncome)],
          ["Expenses"], ...pl.expenses.map((r) => [r.name, centsToPlain(r.balance)]), ["Total expenses", centsToPlain(pl.totalExpenses)],
          ["Net income", centsToPlain(pl.netIncome)],
        ]));
      },
    },
    {
      key: "bs", label: "Balance sheet", go: async () => {
        if (!bs) return;
        downloadText(`sira-books-balance-sheet_${to}.csv`, toCsv([
          ["Balance sheet", `as of ${to}`], [], ["Account", "Amount"],
          ["Assets"], ...bs.assets.map((r) => [r.name, centsToPlain(r.balance)]), ["Total assets", centsToPlain(bs.totalAssets)],
          ["Liabilities"], ...bs.liabilities.map((r) => [r.name, centsToPlain(r.balance)]), ["Total liabilities", centsToPlain(bs.totalLiabilities)],
          ["Equity"], ...bs.equity.map((r) => [r.name, centsToPlain(r.balance)]), ["Net income to date", centsToPlain(bs.netIncomeToDate)],
          ["Total equity", centsToPlain(bs.totalEquity)],
        ]));
      },
    },
    {
      key: "tb", label: "Trial balance", go: async () => {
        if (!tb) return;
        downloadText(`sira-books-trial-balance_${to}.csv`, toCsv([
          ["Account", "Debit", "Credit"],
          ...tb.rows.map((r) => {
            const net = r.debit - r.credit;
            return [r.name, net > 0 ? centsToPlain(net) : "", net < 0 ? centsToPlain(-net) : ""];
          }),
          ["Total", centsToPlain(tb.debit), centsToPlain(tb.credit)],
        ]));
      },
    },
    {
      key: "gl", label: "General ledger (every line)", go: async () => {
        const rows = await convex.query(api.booksExport.generalLedger, { from, to });
        downloadText(`sira-books-general-ledger_${tag}.csv`, toCsv([
          ["Date", "Type", "Num", "Memo", "Account", "Account type", "Customer/vendor", "Debit", "Credit", "Reversal", "Entry"],
          ...rows.map((r) => [r.date, r.txnType, r.num, r.memo, r.account, r.accountType, r.contact,
            r.debit ? centsToPlain(r.debit) : "", r.credit ? centsToPlain(r.credit) : "", r.reversal ? "yes" : "", r.entryId]),
        ]));
      },
    },
    {
      key: "month", label: `P&L by month (${year})`, go: async () => {
        const r = await convex.query(api.booksExport.profitAndLossByMonth, { year });
        downloadText(`sira-books-pnl-by-month_${year}.csv`, toCsv([
          ["Account", ...MONTHS, "Total"],
          ["Income"],
          ...r.income.map((x) => [x.name, ...x.months.map(centsToPlain), centsToPlain(x.months.reduce((a, b) => a + b, 0))]),
          ["Total income", ...r.totals.income.map(centsToPlain), centsToPlain(r.totals.income.reduce((a, b) => a + b, 0))],
          ["Expenses"],
          ...r.expenses.map((x) => [x.name, ...x.months.map(centsToPlain), centsToPlain(x.months.reduce((a, b) => a + b, 0))]),
          ["Total expenses", ...r.totals.expenses.map(centsToPlain), centsToPlain(r.totals.expenses.reduce((a, b) => a + b, 0))],
          ["Net income", ...r.totals.net.map(centsToPlain), centsToPlain(r.totals.net.reduce((a, b) => a + b, 0))],
        ]));
      },
    },
    {
      key: "backup", label: "Full backup (JSON)", go: async () => {
        const b = await convex.query(api.booksExport.backup, {});
        downloadText(`sira-books-backup_${todayIso()}.json`, JSON.stringify(b, null, 1), "application/json");
      },
    },
  ];
  return (
    <section className={card}>
      <h2 className="font-display font-semibold text-text mb-1">Downloads</h2>
      <p className="text-sm text-text-muted mb-3">
        CSV files open in Excel or Google Sheets; send them to your CPA. Keep a full backup in your Finance folder each month.
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((i) => (
          <button key={i.key} className={btnGhost} disabled={busy !== null} onClick={() => run(i.key, i.go)}>
            <Download className="h-4 w-4" /> {busy === i.key ? "Preparing…" : i.label}
          </button>
        ))}
      </div>
      {msg && <p className="text-sm text-accent mt-2">{msg}</p>}
    </section>
  );
}

function ByMonth({ year }: { year: number }) {
  const r = useQuery(api.booksExport.profitAndLossByMonth, { year });
  if (!r) return null;
  const row = (key: string, label: string, months: number[], bold = false) => (
    <tr key={key} className={`border-b border-surface-border ${bold ? "font-semibold" : ""}`}>
      <td className="py-1 pr-3 whitespace-nowrap">{label}</td>
      {months.map((m, i) => <td key={i} className="py-1 px-1 text-right font-mono">{m ? formatCents(m).replace(".00", "") : ""}</td>)}
      <td className="py-1 pl-2 text-right font-mono">{formatCents(months.reduce((a, b) => a + b, 0))}</td>
    </tr>
  );
  return (
    <section className={`${card} overflow-x-auto`}>
      <h2 className="font-display font-semibold text-text mb-3">{year} by month</h2>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-text-muted"><th className="text-left py-1">Account</th>{MONTHS.map((m) => <th key={m} className="text-right px-1">{m}</th>)}<th className="text-right pl-2">Total</th></tr>
        </thead>
        <tbody>
          {r.income.map((x) => row(`i-${x.name}`, x.name, x.months))}
          {row("ti", "Total income", r.totals.income, true)}
          {r.expenses.map((x) => row(`e-${x.name}`, x.name, x.months))}
          {row("te", "Total expenses", r.totals.expenses, true)}
          {row("ni", "Net income", r.totals.net, true)}
        </tbody>
      </table>
    </section>
  );
}
