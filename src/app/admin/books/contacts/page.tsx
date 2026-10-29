"use client";

import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Mail, Phone, Plus } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../../convex/_generated/dataModel";
import { btn, btnGhost, card, formatCents, input } from "@/components/books/format";
import { errorText } from "@/components/books/pickers";

const KINDS = ["customer", "vendor", "contractor", "other"] as const;
type Kind = (typeof KINDS)[number];
const TABS: { key: Kind | "all"; label: string }[] = [
  { key: "customer", label: "Customers" },
  { key: "vendor", label: "Vendors" },
  { key: "contractor", label: "Contractors" },
  { key: "other", label: "Other" },
  { key: "all", label: "All" },
];

type Row = Doc<"booksContacts"> & {
  earned: number;
  spent: number;
  owed: number;
  transactions: number;
  firstDate: string | null;
  lastDate: string | null;
};

export default function BooksContactsPage() {
  const rows = useQuery(api.booksContacts.summary, {}) as Row[] | undefined;
  const [tab, setTab] = useState<Kind | "all">("customer");
  const [q, setQ] = useState("");
  const [showHidden, setShowHidden] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: 0 };
    for (const r of rows ?? []) if (r.active || showHidden) { m[r.kind] = (m[r.kind] ?? 0) + 1; m.all++; }
    return m;
  }, [rows, showHidden]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (rows ?? []).filter(
      (r) =>
        (tab === "all" || r.kind === tab) &&
        (showHidden || r.active) &&
        (!needle || [r.name, r.company, r.email, r.phone, r.notes].some((x) => x?.toLowerCase().includes(needle))),
    );
  }, [rows, tab, q, showHidden]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-lg text-sm border ${tab === t.key ? "bg-primary text-white border-primary" : "border-surface-border text-text"}`}>
            {t.label} <span className="opacity-70 text-xs ml-1">{counts[t.key] ?? 0}</span>
          </button>
        ))}
        <span className="flex-1" />
        <input className={`${input} w-56`} placeholder="Search name, email, phone…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className={btnGhost} onClick={() => setAdding(!adding)}><Plus className="h-4 w-4" /> New contact</button>
      </div>

      {adding && <NewContact defaultKind={tab === "all" ? "customer" : tab} onDone={() => setAdding(false)} />}

      <section className={card}>
        {rows === undefined ? <p className="text-sm text-text-muted">Loading…</p> : shown.length === 0 ? (
          <p className="text-sm text-text-muted">No contacts here yet.</p>
        ) : (
          <ul className="divide-y divide-surface-border">
            {shown.map((r) => (
              <li key={r._id} className="py-2">
                <button className="w-full flex flex-wrap items-center gap-x-4 gap-y-1 text-left text-sm" onClick={() => setOpen(open === r._id ? null : r._id)}>
                  {open === r._id ? <ChevronDown className="h-4 w-4 text-text-muted" /> : <ChevronRight className="h-4 w-4 text-text-muted" />}
                  <span className={`flex-1 min-w-[180px] ${r.active ? "text-text font-medium" : "text-text-dim line-through"}`}>
                    {r.name}
                    {r.company && <span className="text-text-muted font-normal"> · {r.company}</span>}
                  </span>
                  <span className="text-text-muted w-56 truncate">{r.email ?? ""}</span>
                  <span className="text-text-muted w-32 truncate">{r.phone ?? ""}</span>
                  <span className="font-mono w-28 text-right" title={r.kind === "customer" ? "Lifetime income" : "Lifetime spend"}>
                    {r.kind === "customer" ? formatCents(r.earned) : r.spent ? formatCents(r.spent) : ""}
                  </span>
                  <span className={`font-mono w-24 text-right ${r.owed > 0 ? "text-accent" : "text-text-muted"}`} title="Still owes you">
                    {r.owed > 0 ? `${formatCents(r.owed)} due` : ""}
                  </span>
                  <span className="font-mono text-xs text-text-muted w-24 text-right" title="Last transaction">{r.lastDate ?? "—"}</span>
                </button>
                {open === r._id && <Detail row={r} />}
              </li>
            ))}
          </ul>
        )}
        <label className="flex items-center gap-2 text-xs text-text-muted mt-3">
          <input type="checkbox" checked={showHidden} onChange={(e) => setShowHidden(e.target.checked)} /> Show hidden contacts
        </label>
      </section>
    </div>
  );
}

function NewContact({ defaultKind, onDone }: { defaultKind: Kind; onDone: () => void }) {
  const create = useMutation(api.booksContacts.create);
  const [f, setF] = useState({ name: "", company: "", email: "", phone: "", address: "", notes: "", kind: defaultKind });
  const [error, setError] = useState<string | null>(null);
  return (
    <form className={`${card} grid sm:grid-cols-2 gap-3`} onSubmit={async (e) => {
      e.preventDefault();
      setError(null);
      try {
        await create({
          name: f.name, kind: f.kind,
          company: f.company || undefined, email: f.email || undefined, phone: f.phone || undefined,
          address: f.address || undefined, notes: f.notes || undefined,
        });
        onDone();
      } catch (err) {
        setError(errorText(err));
      }
    }}>
      <h2 className="sm:col-span-2 font-display font-semibold text-text">New contact</h2>
      <Fields f={f} setF={setF} />
      <div className="sm:col-span-2 flex items-center gap-3">
        <button className={btn} disabled={!f.name.trim()}>Add contact</button>
        {error && <p className="text-sm text-accent">{error}</p>}
      </div>
    </form>
  );
}

type Form = { name: string; company: string; email: string; phone: string; address: string; notes: string; kind: Kind };

function Fields({ f, setF }: { f: Form; setF: (f: Form) => void }) {
  return (
    <>
      <input className={input} placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      <input className={input} placeholder="Company (optional)" value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} />
      <input className={input} type="email" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      <input className={input} type="tel" placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
      <select className={input} value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as Kind })}>
        {KINDS.map((k) => <option key={k} value={k}>{k[0].toUpperCase() + k.slice(1)}</option>)}
      </select>
      <textarea className={input} rows={1} placeholder="Billing address (shown on invoices)" value={f.address}
        onChange={(e) => setF({ ...f, address: e.target.value })} />
      <textarea className={`${input} sm:col-span-2`} rows={2} placeholder="Notes (how you met, what they bought, follow-up ideas…)" value={f.notes}
        onChange={(e) => setF({ ...f, notes: e.target.value })} />
    </>
  );
}

function Detail({ row }: { row: Row }) {
  const update = useMutation(api.booksContacts.update);
  const activity = useQuery(api.booksContacts.activity, { id: row._id });
  const toForm = (r: Row): Form => ({
    name: r.name, company: r.company ?? "", email: r.email ?? "", phone: r.phone ?? "",
    address: r.address ?? "", notes: r.notes ?? "", kind: r.kind,
  });
  const [f, setF] = useState<Form>(toForm(row));
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => setF(toForm(row)), [row]);

  const save = async () => {
    setMsg(null);
    try {
      const blank = (x: string) => x.trim() || undefined;
      await update({
        id: row._id as Id<"booksContacts">, name: f.name, kind: f.kind,
        company: blank(f.company), email: blank(f.email), phone: blank(f.phone), address: blank(f.address), notes: blank(f.notes),
      });
      setMsg("Saved.");
    } catch (err) {
      setMsg(errorText(err));
    }
  };

  return (
    <div className="mt-3 ml-7 space-y-4 text-sm">
      <div className="flex flex-wrap gap-3 text-text-muted">
        {row.email && <a className="inline-flex items-center gap-1 text-primary underline" href={`mailto:${row.email}`}><Mail className="h-3.5 w-3.5" />{row.email}</a>}
        {row.phone && <a className="inline-flex items-center gap-1 text-primary underline" href={`tel:${row.phone}`}><Phone className="h-3.5 w-3.5" />{row.phone}</a>}
        <span>{row.transactions} transactions{row.firstDate ? `, ${row.firstDate} to ${row.lastDate}` : ""}</span>
        {row.kind === "customer" && <span>Lifetime income {formatCents(row.earned)}</span>}
        {row.spent !== 0 && <span>Paid to them {formatCents(row.spent)}</span>}
        {row.owed !== 0 && <span className="text-accent">Owes {formatCents(row.owed)}</span>}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Fields f={f} setF={setF} />
        <div className="sm:col-span-2 flex items-center gap-3">
          <button className={btnGhost} onClick={save}>Save</button>
          <button className="text-xs text-text-muted hover:text-text" onClick={() => update({ id: row._id, active: !row.active })}>
            {row.active ? "Hide contact" : "Unhide contact"}
          </button>
          {row.kind === "customer" && <Link href="/admin/books/invoices" className="text-xs text-primary underline">New invoice</Link>}
          {msg && <span className="text-xs text-text-muted">{msg}</span>}
        </div>
      </div>
      {activity === undefined ? <p className="text-text-muted">Loading activity…</p> : (
        <>
          {activity.invoices.length > 0 && (
            <div>
              <h4 className="font-semibold text-text mb-1">Invoices</h4>
              <ul className="divide-y divide-surface-border">
                {activity.invoices.map((i) => (
                  <li key={i._id} className="flex gap-3 py-1">
                    <Link className="text-primary underline w-16" href={`/admin/books/invoices/${i._id}`}>#{i.number}</Link>
                    <span className="font-mono text-text-muted w-24">{i.issueDate}</span>
                    <span className="flex-1 text-text-muted">{i.status}</span>
                    <span className="font-mono">{formatCents(i.total)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <h4 className="font-semibold text-text mb-1">Transactions</h4>
            {activity.rows.length === 0 ? <p className="text-text-muted">None yet.</p> : (
              <ul className="divide-y divide-surface-border max-h-72 overflow-auto">
                {activity.rows.map((t) => (
                  <li key={t.entryId} className={`flex gap-3 py-1 ${t.reversed ? "opacity-50" : ""}`}>
                    <span className="font-mono text-text-muted w-24">{t.date}</span>
                    <span className="text-xs font-mono text-text-muted w-28 truncate">{t.txnType ?? ""}{t.num ? ` #${t.num}` : ""}</span>
                    <span className="flex-1 truncate" title={t.memo ?? ""}>{t.memo}</span>
                    <span className="font-mono">{formatCents(t.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
