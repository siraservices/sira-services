"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import { btn, card, formatCents, todayIso } from "@/components/books/format";

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-surface-muted text-text-muted",
  sent: "bg-primary-50 text-primary",
  partial: "bg-amber-100 text-amber-700",
  paid: "bg-green-100 text-green-700",
  void: "bg-surface-muted text-text-dim line-through",
};

export default function BooksInvoicesPage() {
  const [status, setStatus] = useState("");
  const invoices = useQuery(api.booksInvoices.list, status ? { status } : {});
  const aging = useQuery(api.booksInvoices.agingSummary, { today: todayIso() });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/books/invoices/new" className={btn}>
          <Plus className="h-4 w-4" /> New invoice
        </Link>
        <select className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All invoices</option>
          <option value="draft">Drafts</option>
          <option value="sent">Unpaid</option>
          <option value="partial">Partly paid</option>
          <option value="paid">Paid</option>
          <option value="void">Void</option>
        </select>
        <Link href="/admin/books/contacts" className="text-sm text-primary ml-auto">Customers →</Link>
      </div>

      {aging && aging.count > 0 && (
        <section className={`${card} grid grid-cols-2 sm:grid-cols-6 gap-3 text-sm`}>
          {[
            ["Open", aging.total],
            ["Not due", aging.current],
            ["1–30 late", aging.d1_30],
            ["31–60", aging.d31_60],
            ["61–90", aging.d61_90],
            ["90+", aging.d90plus],
          ].map(([label, v]) => (
            <div key={label as string}>
              <p className="text-xs font-mono uppercase text-text-muted">{label}</p>
              <p className="font-display font-semibold">{formatCents(v as number)}</p>
            </div>
          ))}
        </section>
      )}

      <section className={card}>
        {invoices === undefined ? <p className="text-sm text-text-muted">Loading…</p> : invoices.length === 0 ? (
          <p className="text-sm text-text-muted">No invoices yet. Invoices from QuickBooks are in the Journal as history.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-muted border-b border-surface-border">
                <th className="py-2 pr-3 font-normal">#</th>
                <th className="py-2 pr-3 font-normal">Customer</th>
                <th className="py-2 pr-3 font-normal">Date</th>
                <th className="py-2 pr-3 font-normal">Due</th>
                <th className="py-2 pr-3 font-normal text-right">Total</th>
                <th className="py-2 pr-3 font-normal text-right">Balance</th>
                <th className="py-2 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i._id} className="border-b border-surface-border last:border-0">
                  <td className="py-2 pr-3 font-mono">
                    <Link href={`/admin/books/invoices/${i._id}`} className="text-primary">{i.number}</Link>
                  </td>
                  <td className="py-2 pr-3">{i.contactName}</td>
                  <td className="py-2 pr-3 font-mono text-text-muted">{i.issueDate}</td>
                  <td className="py-2 pr-3 font-mono text-text-muted">{i.dueDate}</td>
                  <td className="py-2 pr-3 font-mono text-right">{formatCents(i.total)}</td>
                  <td className="py-2 pr-3 font-mono text-right">{i.status === "void" ? "" : formatCents(i.total - i.amountPaid)}</td>
                  <td className="py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLE[i.status]}`}>{i.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
