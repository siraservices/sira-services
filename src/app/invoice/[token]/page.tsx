"use client";

import { useAction, useQuery } from "convex/react";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { CreditCard, Printer } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { formatCents } from "../../../../convex/booksLib";

export default function PublicInvoicePage() {
  return (
    <Suspense fallback={null}>
      <PublicInvoice />
    </Suspense>
  );
}

function PublicInvoice() {
  const { token } = useParams<{ token: string }>();
  const paidParam = useSearchParams().get("paid");
  const inv = useQuery(api.booksPublic.invoice, { token });
  const checkout = useAction(api.booksStripe.checkout);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (inv === undefined) return <div className="pt-32 pb-20 text-center text-text-muted">Loading…</div>;
  if (inv === null) {
    return (
      <div className="pt-32 pb-20 px-6 text-center">
        <p className="text-text">This invoice link isn&apos;t valid anymore.</p>
        <p className="text-sm text-text-muted mt-2">Please contact aira4development@gmail.com for a new one.</p>
      </div>
    );
  }

  const pay = async () => {
    setError(null);
    setBusy(true);
    try {
      window.location.href = await checkout({ token });
    } catch (err) {
      setError(err instanceof Error ? err.message.replace(/^.*ConvexError: /, "") : String(err));
      setBusy(false);
    }
  };

  return (
    <div className="pt-28 pb-20 px-4">
      <style>{`@media print {
        body * { visibility: hidden; }
        #invoice-sheet, #invoice-sheet * { visibility: visible; }
        #invoice-sheet { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; border: 0; }
      }`}</style>
      <div className="max-w-3xl mx-auto space-y-4">
        {paidParam && inv.balance > 0 && (
          <p className="p-4 rounded-xl bg-primary/10 text-primary text-sm">
            Thank you! Your payment is processing; this page updates once it&apos;s confirmed.
          </p>
        )}
        {inv.status === "paid" && <p className="p-4 rounded-xl bg-primary/10 text-primary text-sm font-semibold">Paid in full. Thank you!</p>}
        <article id="invoice-sheet" className="p-8 bg-white shadow-soft border border-surface-border rounded-xl text-text">
          <header className="flex flex-wrap justify-between gap-6 mb-8">
            <div>
              <p className="text-2xl font-display font-bold text-primary">{inv.business.brand}</p>
              <p className="text-sm">{inv.business.name}</p>
              <p className="text-sm text-text-muted">{inv.business.site}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-display font-semibold">Invoice #{inv.number}</p>
              <p className="text-sm">Date: {inv.issueDate}</p>
              <p className="text-sm">Due: {inv.dueDate}</p>
              {inv.status === "void" && <p className="text-sm font-semibold text-accent">VOID</p>}
              {inv.status === "paid" && <p className="text-sm font-semibold text-primary">PAID</p>}
            </div>
          </header>
          <div className="mb-6 text-sm">
            <p className="text-xs font-mono uppercase text-text-muted mb-1">Bill to</p>
            <p className="font-semibold">{inv.customer.name}</p>
            {inv.customer.company && <p>{inv.customer.company}</p>}
            {inv.customer.address && <p className="whitespace-pre-line">{inv.customer.address}</p>}
          </div>
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b border-text text-left">
                <th className="py-2 font-semibold">Description</th>
                <th className="py-2 font-semibold text-right">Qty</th>
                <th className="py-2 font-semibold text-right">Rate</th>
                <th className="py-2 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {inv.lines.map((l, i) => (
                <tr key={i} className="border-b border-surface-border">
                  <td className="py-2">{l.description}</td>
                  <td className="py-2 text-right">{l.quantity}</td>
                  <td className="py-2 text-right font-mono">{formatCents(l.rate)}</td>
                  <td className="py-2 text-right font-mono">{formatCents(l.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end">
            <dl className="text-sm w-64">
              <div className="flex justify-between py-1"><dt>Total</dt><dd className="font-mono">{formatCents(inv.total)}</dd></div>
              <div className="flex justify-between py-1"><dt>Paid</dt><dd className="font-mono">{formatCents(inv.amountPaid)}</dd></div>
              <div className="flex justify-between py-1 border-t border-text font-bold"><dt>Balance due</dt>
                <dd className="font-mono">{formatCents(inv.balance)}</dd></div>
            </dl>
          </div>
          {inv.memo && <p className="text-sm mt-6 whitespace-pre-line">{inv.memo}</p>}
        </article>
        <div className="flex flex-wrap items-center gap-3">
          {inv.payOnline && inv.balance > 0 && (
            <button onClick={pay} disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-display font-semibold text-white hover:bg-primary-dark disabled:opacity-50">
              <CreditCard className="h-4 w-4" /> {busy ? "Opening secure checkout…" : `Pay ${formatCents(inv.balance)}`}
            </button>
          )}
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-surface-border px-4 py-2 text-sm">
            <Printer className="h-4 w-4" /> Print / save PDF
          </button>
          {error && <p className="text-sm text-accent">{error}</p>}
        </div>
        {!inv.payOnline && inv.balance > 0 && (
          <p className="text-sm text-text-muted">Questions about this invoice? Email aira4development@gmail.com.</p>
        )}
      </div>
    </div>
  );
}
