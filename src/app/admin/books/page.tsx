"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "../../../../convex/_generated/api";
import { card, formatCents, todayIso } from "@/components/books/format";

export default function BooksOverviewPage() {
  const today = todayIso();
  const data = useQuery(api.booksReports.dashboard, { today });
  const recent = useQuery(api.booksLedger.listEntries, { limit: 8 });
  const aging = useQuery(api.booksInvoices.agingSummary, { today });
  const bankCounts = useQuery(api.booksBank.counts, {});
  const toReview = Object.values(bankCounts ?? {}).reduce((s, n) => s + n, 0);
  const todo = useQuery(api.booksReports.todo, { today });

  if (data === undefined) return <p className="text-text-muted">Loading…</p>;

  if (data.entryCount === 0) {
    return (
      <div className={card}>
        <h2 className="font-display font-semibold text-text mb-2">Your books are empty</h2>
        <p className="text-sm text-text-muted mb-4">
          Bring your history over from QuickBooks, or start with a basic chart of accounts.
        </p>
        <div className="flex gap-3 text-sm">
          <Link href="/admin/books/import" className="text-primary font-semibold">Import from QuickBooks →</Link>
          <Link href="/admin/books/accounts" className="text-primary font-semibold">Set up accounts →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <Stat label={`Income ${today.slice(0, 4)}`} value={formatCents(data.ytd.income)} />
        <Stat label={`Expenses ${today.slice(0, 4)}`} value={formatCents(data.ytd.expenses)} />
        <Stat label="Net income" value={formatCents(data.ytd.net)} strong />
      </div>

      {todo && todo.length > 0 && (
        <section className={card}>
          <h2 className="font-display font-semibold text-text mb-2">Needs attention</h2>
          <ul className="text-sm space-y-1.5">
            {todo.map((t, i) => (
              <li key={i} className="flex gap-2">
                <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${t.level === "warn" ? "bg-accent" : "bg-primary/60"}`} />
                <Link href={t.href} className="hover:underline">{t.text}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {((aging && aging.count > 0) || toReview > 0) && (
        <div className="flex flex-wrap gap-3 text-sm">
          {aging && aging.count > 0 && (
            <Link href="/admin/books/invoices" className={`${card} flex-1 min-w-[220px]`}>
              <span className="text-text-muted">Unpaid invoices: </span>
              <b>{aging.count}</b> · {formatCents(aging.total)}
              {aging.total - aging.current > 0 && <span className="text-accent"> · {formatCents(aging.total - aging.current)} overdue</span>}
            </Link>
          )}
          {toReview > 0 && (
            <Link href="/admin/books/bank" className={`${card} flex-1 min-w-[220px]`}>
              <span className="text-text-muted">Bank transactions to review: </span><b>{toReview}</b>
            </Link>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <section className={card}>
          <h2 className="font-display font-semibold text-text mb-3">Cash</h2>
          {data.cash.length === 0 ? (
            <p className="text-sm text-text-muted">Mark your bank and card accounts as cash on the Accounts page.</p>
          ) : (
            <ul className="divide-y divide-surface-border">
              {data.cash.map((a) => (
                <li key={a.id} className="flex justify-between py-2 text-sm">
                  <Link href={`/admin/books/accounts/${a.id}`} className="text-text hover:text-primary">
                    {a.name}
                  </Link>
                  <span className="font-mono">
                    {a.type === "liability" ? `${formatCents(a.balance)} owed` : formatCents(a.balance)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={card}>
          <h2 className="font-display font-semibold text-text mb-3">Top expenses this year</h2>
          <ul className="divide-y divide-surface-border">
            {data.topExpenses.map((a) => (
              <li key={a.id} className="flex justify-between py-2 text-sm">
                <span className="text-text">{a.name}</span>
                <span className="font-mono">{formatCents(a.balance)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className={card}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-display font-semibold text-text">Recent entries</h2>
          <Link href="/admin/books/journal" className="text-sm text-primary">All entries →</Link>
        </div>
        <ul className="divide-y divide-surface-border text-sm">
          {recent?.map((e) => (
            <li key={e._id} className="flex justify-between py-2 gap-4">
              <span className="text-text-muted font-mono w-24 shrink-0">{e.date}</span>
              <span className="flex-1 text-text truncate">{e.memo || e.txnType || "Entry"}</span>
              <span className="font-mono">{formatCents(e.total)}</span>
            </li>
          ))}
        </ul>
      </section>

      {!data.balanced && (
        <p className="text-sm text-accent">
          The balance sheet doesn&apos;t balance. Check the trial balance on the Reports page.
        </p>
      )}
    </div>
  );
}

function Stat({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={card}>
      <p className="text-xs font-mono uppercase tracking-wide text-text-muted mb-1">{label}</p>
      <p className={`text-2xl font-display ${strong ? "font-bold text-primary" : "font-semibold text-text"}`}>{value}</p>
    </div>
  );
}
