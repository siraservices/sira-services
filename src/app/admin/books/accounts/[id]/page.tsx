"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { card, formatCents } from "@/components/books/format";

/** Account register: every line with a running balance. */
export default function BooksAccountRegisterPage() {
  const { id } = useParams<{ id: string }>();
  const data = useQuery(api.booksLedger.register, { accountId: id as Id<"booksAccounts"> });

  if (data === undefined) return <p className="text-text-muted">Loading…</p>;
  const sign = data.account.type === "asset" || data.account.type === "expense" ? 1 : -1;

  return (
    <div className={card}>
      <Link href="/admin/books/accounts" className="text-sm text-text-muted hover:text-text">← Accounts</Link>
      <h2 className="font-display font-semibold text-text mt-2 mb-4">{data.account.name}</h2>
      {data.rows.length === 0 ? (
        <p className="text-sm text-text-muted">No activity yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-muted border-b border-surface-border">
                <th className="py-2 pr-3 font-normal">Date</th>
                <th className="py-2 pr-3 font-normal">Description</th>
                <th className="py-2 pr-3 font-normal text-right">Debit</th>
                <th className="py-2 pr-3 font-normal text-right">Credit</th>
                <th className="py-2 font-normal text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {[...data.rows].reverse().map((r) => (
                <tr key={r._id} className="border-b border-surface-border last:border-0">
                  <td className="py-2 pr-3 font-mono text-text-muted whitespace-nowrap">{r.date}</td>
                  <td className="py-2 pr-3 text-text">{r.memo || r.entryMemo || r.txnType}</td>
                  <td className="py-2 pr-3 font-mono text-right">{r.debit ? formatCents(r.debit) : ""}</td>
                  <td className="py-2 pr-3 font-mono text-right">{r.credit ? formatCents(r.credit) : ""}</td>
                  <td className="py-2 font-mono text-right">{formatCents(sign * r.running)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
