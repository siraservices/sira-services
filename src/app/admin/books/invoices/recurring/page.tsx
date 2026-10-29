"use client";

import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Pause, Play, Plus, Trash2 } from "lucide-react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { firstRecurringDate, invoiceTotal } from "../../../../../../convex/booksOpsLib";
import { btn, btnGhost, card, formatCents, input, toCents, todayIso } from "@/components/books/format";
import { AccountSelect, ContactSelect, errorText } from "@/components/books/pickers";

const EVERY: Record<number, string> = { 1: "Monthly", 2: "Every 2 months", 3: "Quarterly", 6: "Every 6 months", 12: "Yearly" };
const ordinal = (n: number) => `${n}${n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th"}`;

export default function RecurringPage() {
  return (
    <Suspense fallback={null}>
      <Recurring />
    </Suspense>
  );
}

function Recurring() {
  const from = useSearchParams().get("from");
  const rows = useQuery(api.booksRecurring.list, {});
  const update = useMutation(api.booksRecurring.update);
  const remove = useMutation(api.booksRecurring.remove);
  const runNow = useMutation(api.booksRecurring.runNow);
  const [adding, setAdding] = useState(!!from);
  const [msg, setMsg] = useState<string | null>(null);
  const act = async (fn: () => Promise<unknown>, ok?: string) => {
    setMsg(null);
    try {
      await fn();
      if (ok) setMsg(ok);
    } catch (err) {
      setMsg(errorText(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/books/invoices" className="text-sm text-text-muted hover:text-text">← Invoices</Link>
        <span className="flex-1" />
        <button className={btnGhost} onClick={() => act(() => runNow({}), "Running now. Invoices due today or earlier will appear in a moment.")}>
          Run now
        </button>
        <button className={btn} onClick={() => setAdding(!adding)}><Plus className="h-4 w-4" /> New schedule</button>
      </div>
      {msg && <p className="text-sm text-text-muted">{msg}</p>}
      {adding && <NewSchedule fromInvoice={from} onDone={() => setAdding(false)} />}
      <section className={card}>
        <h2 className="font-display font-semibold text-text mb-1">Recurring invoices</h2>
        <p className="text-sm text-text-muted mb-3">
          Each schedule creates a posted invoice on its date (checked every morning at 9am Eastern) and, if you choose, emails
          the customer a view-and-pay link.
        </p>
        {rows === undefined ? <p className="text-sm text-text-muted">Loading…</p> : rows.length === 0 ? (
          <p className="text-sm text-text-muted">No schedules yet.</p>
        ) : (
          <ul className="divide-y divide-surface-border text-sm">
            {rows.map((r) => (
              <li key={r._id} className={`py-3 flex flex-wrap items-center gap-x-4 gap-y-1 ${r.active ? "" : "opacity-60"}`}>
                <span className="flex-1 min-w-[200px]">
                  <b>{r.contactName}</b> · {r.lines.map((l) => l.description).join(", ")}
                  <span className="block text-xs text-text-muted">
                    {EVERY[r.everyMonths] ?? `Every ${r.everyMonths} months`} on the {ordinal(r.dayOfMonth)} · due in {r.termsDays} days
                    {r.endDate ? ` · ends ${r.endDate}` : ""}
                    {r.autoEmail ? ` · emails ${r.contactEmail ?? "(no email on file!)"}` : " · not emailed"}
                  </span>
                  {r.lastInvoice && (
                    <span className="block text-xs text-text-muted">
                      Last: <Link className="text-primary underline" href={`/admin/books/invoices/${r.lastInvoice._id}`}>#{r.lastInvoice.number}</Link> on {r.lastInvoice.issueDate} ({r.lastInvoice.status})
                    </span>
                  )}
                  {r.lastError && <span className="block text-xs text-accent">{r.lastError}</span>}
                </span>
                <span className="font-mono">{formatCents(r.total)}</span>
                <label className="text-xs text-text-muted flex items-center gap-1">
                  Next
                  <input type="date" className={`${input} w-36`} value={r.nextDate} onChange={(e) => act(() => update({ id: r._id, nextDate: e.target.value }))} />
                </label>
                <label className="text-xs flex items-center gap-1">
                  <input type="checkbox" checked={r.autoEmail} onChange={(e) => act(() => update({ id: r._id, autoEmail: e.target.checked }))} /> Email
                </label>
                <button className="text-text-muted hover:text-text" title={r.active ? "Pause" : "Resume"} onClick={() => act(() => update({ id: r._id, active: !r.active }))}>
                  {r.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button className="text-text-muted hover:text-accent" title="Delete schedule (invoices already made stay)" onClick={() => act(() => remove({ id: r._id }))}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

type Line = { description: string; quantity: string; rate: string; accountId: string };

function NewSchedule({ fromInvoice, onDone }: { fromInvoice: string | null; onDone: () => void }) {
  const create = useMutation(api.booksRecurring.create);
  const accounts = useQuery(api.booksAccounts.list, {});
  const source = useQuery(api.booksInvoices.get, fromInvoice ? { id: fromInvoice as Id<"booksInvoices"> } : "skip");
  const today = todayIso();
  const [contactId, setContactId] = useState("");
  const [lines, setLines] = useState<Line[]>([{ description: "", quantity: "1", rate: "", accountId: "" }]);
  const [memo, setMemo] = useState("");
  const [everyMonths, setEvery] = useState(1);
  const [day, setDay] = useState(Number(today.slice(8, 10)));
  const [terms, setTerms] = useState(14);
  const [start, setStart] = useState(firstRecurringDate(today, Number(today.slice(8, 10))));
  const [end, setEnd] = useState("");
  const [autoEmail, setAutoEmail] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const services = accounts?.find((a) => a.type === "income" && a.name === "Services")?._id ?? "";

  useEffect(() => {
    if (!source) return;
    setContactId(source.contactId);
    setLines(source.lines.map((l) => ({ description: l.description, quantity: String(l.quantity), rate: (l.rate / 100).toFixed(2), accountId: l.accountId })));
    setMemo(source.memo ?? "");
    const d = Number(source.issueDate.slice(8, 10));
    setDay(d);
    setStart(firstRecurringDate(today, d));
    const t = Math.round((Date.parse(source.dueDate) - Date.parse(source.issueDate)) / 86400000);
    if (t >= 0 && t <= 120) setTerms(t);
  }, [source, today]);
  useEffect(() => {
    if (services) setLines((ls) => ls.map((l) => (l.accountId ? l : { ...l, accountId: services })));
  }, [services]);

  let parsed: { description: string; quantity: number; rate: number; accountId: Id<"booksAccounts"> }[] = [];
  try {
    parsed = lines.map((l) => ({ description: l.description, quantity: Number(l.quantity), rate: toCents(l.rate || "0"), accountId: l.accountId as Id<"booksAccounts"> }));
  } catch {
    parsed = [];
  }

  return (
    <form className={`${card} space-y-3 text-sm`} onSubmit={async (e) => {
      e.preventDefault();
      setError(null);
      if (!parsed.length) return setError("Check the line amounts.");
      try {
        await create({
          contactId: contactId as Id<"booksContacts">, lines: parsed, memo: memo || undefined,
          everyMonths, dayOfMonth: day, termsDays: terms, startDate: start, endDate: end || undefined, autoEmail,
        });
        onDone();
      } catch (err) {
        setError(errorText(err));
      }
    }}>
      <h2 className="font-display font-semibold text-text">New recurring invoice</h2>
      <div className="grid sm:grid-cols-3 gap-3">
        <ContactSelect value={contactId} onChange={setContactId} kind="customer" placeholder="Customer…" />
        <select className={input} value={everyMonths} onChange={(e) => setEvery(Number(e.target.value))}>
          {Object.entries(EVERY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <label className="flex items-center gap-2">On day
          <input className={`${input} w-20`} type="number" min={1} max={31} value={day} onChange={(e) => {
            const d = Number(e.target.value);
            setDay(d);
            if (d >= 1 && d <= 31) setStart(firstRecurringDate(today, d));
          }} />
        </label>
      </div>
      {lines.map((l, i) => (
        <div key={i} className="grid sm:grid-cols-12 gap-2">
          <input className={`${input} sm:col-span-5`} placeholder="Description" value={l.description} onChange={(e) => setLines(lines.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))} />
          <input className={`${input} sm:col-span-1 text-right`} inputMode="decimal" value={l.quantity} onChange={(e) => setLines(lines.map((x, j) => (j === i ? { ...x, quantity: e.target.value } : x)))} />
          <input className={`${input} sm:col-span-2 text-right`} inputMode="decimal" placeholder="Rate" value={l.rate} onChange={(e) => setLines(lines.map((x, j) => (j === i ? { ...x, rate: e.target.value } : x)))} />
          <div className="sm:col-span-3"><AccountSelect value={l.accountId} onChange={(v) => setLines(lines.map((x, j) => (j === i ? { ...x, accountId: v } : x)))} types={["income"]} /></div>
          <button type="button" className="text-text-muted hover:text-accent" onClick={() => setLines(lines.filter((_, j) => j !== i))} disabled={lines.length === 1}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button type="button" className="text-xs text-primary" onClick={() => setLines([...lines, { description: "", quantity: "1", rate: "", accountId: services }])}>+ Add line</button>
      <div className="grid sm:grid-cols-4 gap-3 items-end">
        <label>First invoice<input type="date" className={input} value={start} onChange={(e) => setStart(e.target.value)} /></label>
        <label>Ends (optional)<input type="date" className={input} value={end} onChange={(e) => setEnd(e.target.value)} /></label>
        <label>Due in (days)<input type="number" min={0} max={120} className={input} value={terms} onChange={(e) => setTerms(Number(e.target.value))} /></label>
        <label className="flex items-center gap-2 pb-2"><input type="checkbox" checked={autoEmail} onChange={(e) => setAutoEmail(e.target.checked)} /> Email it to the customer</label>
      </div>
      <textarea className={input} rows={2} placeholder="Note on each invoice (optional)" value={memo} onChange={(e) => setMemo(e.target.value)} />
      <div className="flex items-center gap-3">
        <button className={btn} disabled={!contactId}>Save schedule · {formatCents(parsed.length ? invoiceTotal(parsed) : 0)} each</button>
        {error && <span className="text-accent">{error}</span>}
      </div>
    </form>
  );
}
