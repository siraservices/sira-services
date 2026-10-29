"use client";

import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Plus, Printer, Trash2 } from "lucide-react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { invoiceTotal, lineAmount } from "../../../../../../convex/booksOpsLib";
import { btn, btnGhost, card, formatCents, input, toCents, todayIso } from "@/components/books/format";
import { AccountSelect, ContactSelect, errorText } from "@/components/books/pickers";

type Line = { description: string; quantity: string; rate: string; accountId: string };

const addDays = (iso: string, n: number) =>
  new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);

function cents(s: string): number | null {
  try {
    return toCents(s || "0");
  } catch {
    return null;
  }
}

export default function BooksInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const inv = useQuery(api.booksInvoices.get, isNew ? "skip" : { id: id as Id<"booksInvoices"> });
  if (!isNew && inv === undefined) return <p className="text-text-muted">Loading…</p>;
  if (!isNew && inv === null) return <p className="text-text-muted">Invoice not found.</p>;
  if (isNew || inv?.status === "draft") return <Editor invoice={inv ?? null} />;
  return <View invoice={inv!} />;
}

type Invoice = NonNullable<FunctionReturnType<typeof api.booksInvoices.get>>;

function Editor({ invoice }: { invoice: Invoice | null }) {
  const router = useRouter();
  const accounts = useQuery(api.booksAccounts.list, {});
  const suggested = useQuery(api.booksInvoices.nextNumber, invoice ? "skip" : {});
  const save = useMutation(api.booksInvoices.saveDraft);
  const send = useMutation(api.booksInvoices.send);
  const remove = useMutation(api.booksInvoices.deleteDraft);

  const today = todayIso();
  const [number, setNumber] = useState(invoice?.number ?? "");
  const [contactId, setContactId] = useState<string>(invoice?.contactId ?? "");
  const [issueDate, setIssueDate] = useState(invoice?.issueDate ?? today);
  const [dueDate, setDueDate] = useState(invoice?.dueDate ?? addDays(today, 15));
  const [memo, setMemo] = useState(invoice?.memo ?? "");
  const [lines, setLines] = useState<Line[]>(
    invoice?.lines.map((l) => ({
      description: l.description,
      quantity: String(l.quantity),
      rate: (l.rate / 100).toFixed(2),
      accountId: l.accountId,
    })) ?? [{ description: "", quantity: "1", rate: "", accountId: "" }],
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const defaultIncome = useMemo(
    () => accounts?.find((a) => a.type === "income" && a.name === "Services")?._id ?? accounts?.find((a) => a.type === "income")?._id ?? "",
    [accounts],
  );
  useEffect(() => {
    if (!number && suggested) setNumber(suggested);
  }, [suggested, number]);
  useEffect(() => {
    if (defaultIncome) setLines((ls) => ls.map((l) => (l.accountId ? l : { ...l, accountId: defaultIncome })));
  }, [defaultIncome]);

  const parsed = lines.map((l) => ({
    description: l.description,
    quantity: Number(l.quantity),
    rate: cents(l.rate) ?? 0,
    accountId: l.accountId as Id<"booksAccounts">,
  }));
  const total = invoiceTotal(parsed.map((l) => ({ quantity: Number.isFinite(l.quantity) ? l.quantity : 0, rate: l.rate })));
  const setLine = (i: number, p: Partial<Line>) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...p } : l)));

  const persist = async (): Promise<Id<"booksInvoices"> | null> => {
    setError(null);
    if (!contactId) {
      setError("Pick a customer.");
      return null;
    }
    try {
      return await save({
        id: invoice?._id,
        number,
        contactId: contactId as Id<"booksContacts">,
        issueDate,
        dueDate,
        memo: memo || undefined,
        lines: parsed,
      });
    } catch (err) {
      setError(errorText(err));
      return null;
    }
  };

  const onSave = async () => {
    setBusy(true);
    const saved = await persist();
    setBusy(false);
    if (saved && !invoice) router.replace(`/admin/books/invoices/${saved}`);
  };

  const onSend = async () => {
    setBusy(true);
    const saved = await persist();
    if (saved) {
      try {
        await send({ id: saved });
        router.replace(`/admin/books/invoices/${saved}`);
      } catch (err) {
        setError(errorText(err));
      }
    }
    setBusy(false);
  };

  return (
    <div className="space-y-6">
      <Link href="/admin/books/invoices" className="text-sm text-text-muted hover:text-text">← Invoices</Link>
      <section className={card}>
        <h2 className="font-display font-semibold text-text mb-4">{invoice ? `Draft invoice #${invoice.number}` : "New invoice"}</h2>
        <div className="grid sm:grid-cols-4 gap-3 mb-4">
          <label className="text-sm sm:col-span-2">
            <span className="block text-text-muted mb-1">Customer</span>
            <ContactSelect value={contactId} onChange={setContactId} kind="customer" />
            <Link href="/admin/books/contacts" className="text-xs text-primary">Add a customer</Link>
          </label>
          <label className="text-sm">
            <span className="block text-text-muted mb-1">Invoice #</span>
            <input className={input} value={number} onChange={(e) => setNumber(e.target.value)} />
          </label>
          <div />
          <label className="text-sm">
            <span className="block text-text-muted mb-1">Invoice date</span>
            <input type="date" className={input} value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
          </label>
          <label className="text-sm">
            <span className="block text-text-muted mb-1">Due date</span>
            <input type="date" className={input} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </label>
          <div className="text-sm flex items-end gap-2 sm:col-span-2">
            {[0, 15, 30].map((n) => (
              <button key={n} type="button" className={btnGhost} onClick={() => setDueDate(addDays(issueDate, n))}>
                {n === 0 ? "On receipt" : `Net ${n}`}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="hidden sm:grid grid-cols-[1fr_80px_110px_110px_200px_32px] gap-2 text-xs text-text-muted">
            <span>Description</span><span>Qty</span><span>Rate</span><span className="text-right">Amount</span><span>Income account</span><span />
          </div>
          {lines.map((l, i) => {
            const amt = lineAmount(Number(l.quantity) || 0, cents(l.rate) ?? 0);
            return (
              <div key={i} className="grid sm:grid-cols-[1fr_80px_110px_110px_200px_32px] gap-2 items-center">
                <input className={input} placeholder="What you did" value={l.description} onChange={(e) => setLine(i, { description: e.target.value })} />
                <input className={`${input} text-right`} inputMode="decimal" value={l.quantity} onChange={(e) => setLine(i, { quantity: e.target.value })} />
                <input className={`${input} text-right`} inputMode="decimal" placeholder="0.00" value={l.rate} onChange={(e) => setLine(i, { rate: e.target.value })} />
                <span className="font-mono text-sm text-right">{formatCents(amt)}</span>
                <AccountSelect value={l.accountId} onChange={(v) => setLine(i, { accountId: v })} types={["income"]} />
                <button type="button" aria-label="Remove line" className="text-text-muted hover:text-accent disabled:opacity-30"
                  disabled={lines.length <= 1} onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
          <button type="button" className={btnGhost}
            onClick={() => setLines((ls) => [...ls, { description: "", quantity: "1", rate: "", accountId: defaultIncome }])}>
            <Plus className="h-4 w-4" /> Line
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <textarea className={input} rows={3} placeholder="Note to the customer (payment details, thank you…)" value={memo}
            onChange={(e) => setMemo(e.target.value)} />
          <div className="text-right">
            <p className="text-sm text-text-muted">Total</p>
            <p className="text-2xl font-display font-bold">{formatCents(total)}</p>
          </div>
        </div>

        {error && <p className="text-sm text-accent mt-3">{error}</p>}
        <div className="flex flex-wrap gap-3 mt-4">
          <button className={btnGhost} disabled={busy} onClick={onSave}>Save draft</button>
          <button className={btn} disabled={busy || total <= 0} onClick={onSend}>Save and mark as sent</button>
          {invoice && (
            <button className="text-sm text-accent ml-auto" disabled={busy}
              onClick={async () => {
                if (!confirm("Delete this draft?")) return;
                await remove({ id: invoice._id });
                router.replace("/admin/books/invoices");
              }}>
              Delete draft
            </button>
          )}
        </div>
        <p className="text-xs text-text-muted mt-3">
          Marking it as sent records the income and the amount owed in your books. Then print or save it as a PDF to send.
        </p>
      </section>
    </div>
  );
}

function View({ invoice }: { invoice: Invoice }) {
  const accounts = useQuery(api.booksAccounts.list, {});
  const recordPayment = useMutation(api.booksInvoices.recordPayment);
  const voidInvoice = useMutation(api.booksInvoices.voidInvoice);
  const balance = invoice.total - invoice.amountPaid;
  const open = invoice.status === "sent" || invoice.status === "partial";

  const defaultDeposit = accounts?.find((a) => a.isCash && a.type === "asset" && a.name.includes("Checking"))?._id ?? "";
  const defaultFee = accounts?.find((a) => a.type === "expense" && /payments fees|merchant|stripe/i.test(a.name))?._id ?? "";
  const [pay, setPay] = useState({ date: todayIso(), amount: "", fee: "", depositAccountId: "", feeAccountId: "", method: "" });
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setPay((p) => ({
      ...p,
      amount: p.amount || (balance / 100).toFixed(2),
      depositAccountId: p.depositAccountId || defaultDeposit,
      feeAccountId: p.feeAccountId || defaultFee,
    }));
  }, [balance, defaultDeposit, defaultFee]);

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const amount = cents(pay.amount);
    const fee = cents(pay.fee);
    if (amount === null || fee === null) return setError("Amounts must be numbers.");
    try {
      await recordPayment({
        invoiceId: invoice._id,
        date: pay.date,
        amount,
        fee: fee || undefined,
        feeAccountId: fee ? (pay.feeAccountId as Id<"booksAccounts">) : undefined,
        depositAccountId: pay.depositAccountId as Id<"booksAccounts">,
        method: pay.method || undefined,
      });
      setPay((p) => ({ ...p, amount: "", fee: "" }));
    } catch (err) {
      setError(errorText(err));
    }
  };

  return (
    <div className="space-y-6">
      <style>{`@media print {
        body * { visibility: hidden; }
        #invoice-sheet, #invoice-sheet * { visibility: visible; }
        #invoice-sheet { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; border: 0; }
      }`}</style>
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/books/invoices" className="text-sm text-text-muted hover:text-text">← Invoices</Link>
        <span className="ml-auto" />
        <button className={btnGhost} onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Print / save PDF
        </button>
        {invoice.status !== "void" && (
          <button className="text-sm text-accent" onClick={async () => {
            if (!confirm("Void this invoice? Its income and any payments are reversed today; the history stays.")) return;
            try {
              await voidInvoice({ id: invoice._id, date: todayIso() });
            } catch (err) {
              alert(errorText(err));
            }
          }}>
            Void
          </button>
        )}
      </div>

      <article id="invoice-sheet" className="p-8 bg-white shadow-soft border border-surface-border rounded-xl text-text">
        <header className="flex flex-wrap justify-between gap-6 mb-8">
          <div>
            <p className="text-2xl font-display font-bold text-primary">SIRA</p>
            <p className="text-sm">Aira Development LLC</p>
            <p className="text-sm text-text-muted">sira.services</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-display font-semibold">Invoice #{invoice.number}</p>
            <p className="text-sm">Date: {invoice.issueDate}</p>
            <p className="text-sm">Due: {invoice.dueDate}</p>
            {invoice.status === "void" && <p className="text-sm font-semibold text-accent">VOID</p>}
            {invoice.status === "paid" && <p className="text-sm font-semibold text-primary">PAID</p>}
          </div>
        </header>
        <div className="mb-6 text-sm">
          <p className="text-xs font-mono uppercase text-text-muted mb-1">Bill to</p>
          <p className="font-semibold">{invoice.contact?.name}</p>
          {invoice.contact?.company && <p>{invoice.contact.company}</p>}
          {invoice.contact?.address && <p className="whitespace-pre-line">{invoice.contact.address}</p>}
          {invoice.contact?.email && <p>{invoice.contact.email}</p>}
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
            {invoice.lines.map((l, i) => (
              <tr key={i} className="border-b border-surface-border">
                <td className="py-2">{l.description}</td>
                <td className="py-2 text-right">{l.quantity}</td>
                <td className="py-2 text-right font-mono">{formatCents(l.rate)}</td>
                <td className="py-2 text-right font-mono">{formatCents(lineAmount(l.quantity, l.rate))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end">
          <dl className="text-sm w-64">
            <div className="flex justify-between py-1"><dt>Total</dt><dd className="font-mono">{formatCents(invoice.total)}</dd></div>
            <div className="flex justify-between py-1"><dt>Paid</dt><dd className="font-mono">{formatCents(invoice.amountPaid)}</dd></div>
            <div className="flex justify-between py-1 border-t border-text font-bold"><dt>Balance due</dt>
              <dd className="font-mono">{formatCents(invoice.status === "void" ? 0 : balance)}</dd></div>
          </dl>
        </div>
        {invoice.memo && <p className="text-sm mt-6 whitespace-pre-line">{invoice.memo}</p>}
      </article>

      {invoice.payments.length > 0 && (
        <section className={card}>
          <h2 className="font-display font-semibold text-text mb-2">Payments</h2>
          <ul className="text-sm divide-y divide-surface-border">
            {invoice.payments.map((p) => (
              <li key={p._id} className="flex gap-3 py-2">
                <span className="font-mono text-text-muted w-24">{p.date}</span>
                <span className="flex-1">{p.method ?? "Payment"}{p.fee ? ` (fee ${formatCents(p.fee)})` : ""}</span>
                <span className="font-mono">{formatCents(p.amount)}</span>
                {p.reversedEntryId && <span className="text-xs text-accent">reversed</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {open && (
        <form onSubmit={submitPayment} className={`${card} grid sm:grid-cols-3 gap-3`}>
          <h2 className="sm:col-span-3 font-display font-semibold text-text">Record a payment</h2>
          <label className="text-sm">
            <span className="block text-text-muted mb-1">Date received</span>
            <input type="date" className={input} value={pay.date} onChange={(e) => setPay({ ...pay, date: e.target.value })} />
          </label>
          <label className="text-sm">
            <span className="block text-text-muted mb-1">Amount the customer paid</span>
            <input className={`${input} text-right`} inputMode="decimal" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} />
          </label>
          <label className="text-sm">
            <span className="block text-text-muted mb-1">Deposited to</span>
            <AccountSelect value={pay.depositAccountId} onChange={(v) => setPay({ ...pay, depositAccountId: v })} types={["asset"]} />
          </label>
          <label className="text-sm">
            <span className="block text-text-muted mb-1">Processor fee (optional)</span>
            <input className={`${input} text-right`} inputMode="decimal" placeholder="0.00" value={pay.fee} onChange={(e) => setPay({ ...pay, fee: e.target.value })} />
          </label>
          <label className="text-sm">
            <span className="block text-text-muted mb-1">Fee account</span>
            <AccountSelect value={pay.feeAccountId} onChange={(v) => setPay({ ...pay, feeAccountId: v })} types={["expense"]} />
          </label>
          <label className="text-sm">
            <span className="block text-text-muted mb-1">Method</span>
            <input className={input} placeholder="Zelle, ACH, Stripe, Upwork…" value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })} />
          </label>
          <div className="sm:col-span-3 flex items-center gap-3">
            <button className={btn}>Record payment</button>
            {error && <p className="text-sm text-accent">{error}</p>}
          </div>
        </form>
      )}
    </div>
  );
}
