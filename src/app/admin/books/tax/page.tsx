"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { ChevronDown, ChevronRight, Download, Trash2 } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { SCHEDULE_C_LINES, mileageRate } from "../../../../../convex/booksTaxLib";
import { btn, btnGhost, card, formatCents, input, todayIso } from "@/components/books/format";
import { centsToPlain, downloadText, toCsv } from "@/components/books/download";
import { ContactSelect, errorText } from "@/components/books/pickers";

type Tab = "schedule-c" | "estimates" | "1099" | "mileage";
const TABS: { key: Tab; label: string }[] = [
  { key: "schedule-c", label: "Schedule C" },
  { key: "estimates", label: "Quarterly estimates" },
  { key: "1099", label: "1099s" },
  { key: "mileage", label: "Mileage" },
];

export default function BooksTaxPage() {
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(thisYear);
  const [tab, setTab] = useState<Tab>("schedule-c");
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-lg text-sm border ${tab === t.key ? "bg-primary text-white border-primary" : "border-surface-border text-text"}`}>
            {t.label}
          </button>
        ))}
        <span className="flex-1" />
        <select className={`${input} w-28`} value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {[thisYear, thisYear - 1, thisYear - 2, thisYear - 3].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      {tab === "schedule-c" && <ScheduleC year={year} />}
      {tab === "estimates" && <Estimates year={year} />}
      {tab === "1099" && <Form1099 year={year} />}
      {tab === "mileage" && <Mileage year={year} />}
      <p className="text-xs text-text-muted">
        Planning numbers from your books, not tax advice. Have your CPA review before filing.
      </p>
    </div>
  );
}

function ScheduleC({ year }: { year: number }) {
  const r = useQuery(api.booksTax.scheduleCReport, { year });
  const setLine = useMutation(api.booksTax.setScheduleCLine);
  const [open, setOpen] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  if (!r) return <p className="text-sm text-text-muted">Loading…</p>;
  return (
    <>
      <section className={card}>
        <div className="flex flex-wrap gap-x-8 gap-y-2 mb-4 text-sm">
          <Big label="Gross income (line 7)" value={r.grossIncome} />
          <Big label="Total expenses (line 28)" value={r.totalExpenses} />
          {r.homeOffice !== 0 && <Big label="Home office (line 30)" value={r.homeOffice} />}
          <Big label="Net profit (line 31)" value={r.netProfit} strong />
        </div>
        {r.warnings.map((w) => <p key={w} className="text-sm text-accent mb-2">{w}</p>)}
        <button className={`${btnGhost} mb-3`} onClick={() => downloadText(`sira-books-schedule-c_${year}.csv`, toCsv([
          ["Schedule C", String(year)], [], ["Line", "Description", "Amount", "Account", "Account amount"],
          ...r.lines.flatMap((l) => [
            [l.code, l.label, centsToPlain(l.amount), "", ""],
            ...l.accounts.map((a) => ["", "", "", a.name, centsToPlain(a.amount)]),
          ]),
          [], ["7", "Gross income", centsToPlain(r.grossIncome)], ["28", "Total expenses", centsToPlain(r.totalExpenses)],
          ["29", "Tentative profit", centsToPlain(r.tentativeProfit)], ["30", "Business use of home", centsToPlain(r.homeOffice)],
          ["31", "Net profit", centsToPlain(r.netProfit)], ["", "Meals before 50% limit", centsToPlain(r.mealsFull)],
        ]))}>
          <Download className="h-4 w-4" /> Download for CPA
        </button>
        <ul className="divide-y divide-surface-border text-sm">
          {r.lines.map((l) => (
            <li key={l.code}>
              <button className="w-full flex items-center gap-3 py-2 text-left" onClick={() => setOpen(open === l.code ? null : l.code)}>
                {open === l.code ? <ChevronDown className="h-4 w-4 text-text-muted" /> : <ChevronRight className="h-4 w-4 text-text-muted" />}
                <span className="font-mono text-text-muted w-12">{l.code === "none" ? "—" : l.code}</span>
                <span className="flex-1">{l.label}</span>
                <span className="font-mono">{formatCents(l.amount)}</span>
              </button>
              {open === l.code && (
                <ul className="pl-20 pb-2 text-text-muted">
                  {l.accounts.map((a) => (
                    <li key={a.id} className="flex gap-3 py-0.5">
                      <span className="flex-1">{a.name}</span>
                      <span className="font-mono">{formatCents(a.amount)}</span>
                    </li>
                  ))}
                  {l.code === "24b" && <li className="text-xs pt-1">Meals total {formatCents(r.mealsFull)}; 50% is deductible.</li>}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </section>
      <section className={card}>
        <button className="font-display font-semibold text-text flex items-center gap-2" onClick={() => setShowMap(!showMap)}>
          {showMap ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />} Which line each account goes on
        </button>
        {showMap && (
          <>
            <p className="text-sm text-text-muted my-2">Lines in grey were guessed from the account name. Change any of them; your choice is saved.</p>
            <ul className="divide-y divide-surface-border text-sm">
              {r.mapping.map((m) => (
                <li key={m._id} className="flex items-center gap-3 py-1.5">
                  <span className="flex-1">{m.name}</span>
                  <select className={`${input} w-80 ${m.guessed ? "text-text-muted" : ""}`} value={m.guessed ? "" : m.line}
                    onChange={(e) => setLine({ accountId: m._id as Id<"booksAccounts">, line: e.target.value || undefined })}>
                    <option value="">Auto: {SCHEDULE_C_LINES.find((l) => l.code === m.line)?.label ?? m.line}</option>
                    {SCHEDULE_C_LINES.filter((l) => (m.type === "income" ? l.part === "income" || l.part === "none" : l.part !== "income")).map((l) => (
                      <option key={l.code} value={l.code}>{l.code === "none" ? "" : `${l.code} · `}{l.label}</option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </>
  );
}

function Estimates({ year }: { year: number }) {
  const today = todayIso();
  const asOf = year < Number(today.slice(0, 4)) ? `${year}-12-31` : today;
  const e = useQuery(api.booksTax.estimates, { year, asOf });
  const [rate, setRate] = useState("12");
  if (!e) return <p className="text-sm text-text-muted">Loading…</p>;
  const incomeRate = Math.max(0, Math.min(50, Number(rate) || 0)) / 100;
  // Rough federal income tax on profit after half of SE tax (no other income, deductions or credits).
  const incomeTax = Math.round(Math.max(0, e.netProfit - e.selfEmployment.deductibleHalf) * incomeRate);
  const total = e.selfEmployment.total + incomeTax;
  const perQuarter = Math.round(total / 4);
  return (
    <section className={`${card} space-y-4 text-sm`}>
      <div className="flex flex-wrap gap-x-8 gap-y-2">
        <Big label={`Net profit through ${asOf}`} value={e.netProfit} />
        <Big label="Self-employment tax" value={e.selfEmployment.total} />
        <Big label="Income tax (rough)" value={incomeTax} />
        <Big label="Set aside so far" value={total} strong />
      </div>
      <p className="text-text-muted">
        SE tax is 15.3% of 92.35% of profit (Social Security part capped at the wage base). Income tax uses the rate below on
        profit minus half of SE tax. Your real rate depends on your W-2 pay, deductions and credits, so ask your CPA for it.
      </p>
      <label className="flex items-center gap-2">
        Income tax rate on business profit
        <input className={`${input} w-20 text-right`} inputMode="decimal" value={rate} onChange={(ev) => setRate(ev.target.value)} />%
      </label>
      <table className="w-full">
        <thead>
          <tr className="text-left text-text-muted"><th className="py-1">Quarter</th><th>Covers</th><th>Due</th><th className="text-right">Even share</th></tr>
        </thead>
        <tbody>
          {e.due.map((d) => (
            <tr key={d.quarter} className={`border-t border-surface-border ${d.due < today ? "text-text-muted" : ""}`}>
              <td className="py-1">{d.quarter}</td><td>{d.covers}</td><td className="font-mono">{d.due}</td>
              <td className="text-right font-mono">{formatCents(perQuarter)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Federal estimates paid for {year}: <b className="font-mono">{formatCents(e.federalPaid)}</b>
        {e.statePaid ? <> · State: <b className="font-mono">{formatCents(e.statePaid)}</b></> : null}
        <span className="text-text-muted"> (from the Federal/State estimated taxes accounts)</span>
      </p>
      <p className="text-text-muted">
        If your W-2 withholding covers 100% of last year&apos;s total tax (110% if your income was over $150k), you
        generally won&apos;t owe an underpayment penalty even without estimates. Pay at irs.gov/payments or by raising your W-4 withholding.
      </p>
    </section>
  );
}

function Form1099({ year }: { year: number }) {
  const r = useQuery(api.booksTax.form1099, { year });
  const setTrack = useMutation(api.booksTax.setTrack1099);
  if (!r) return <p className="text-sm text-text-muted">Loading…</p>;
  return (
    <section className={`${card} space-y-3 text-sm`}>
      <p className="text-text-muted">
        For {year} you file a 1099-NEC for each person or unincorporated business you paid {formatCents(r.threshold)} or more for
        services by bank, check or Zelle. Payments by credit card or through PayPal, Venmo or Stripe don&apos;t count (the
        processor reports those on a 1099-K). Tick
        “1099” for contractors you need to track, and get a W-9 from them before you pay. Deadline: January 31.
      </p>
      <button className={btnGhost} onClick={() => downloadText(`sira-books-1099-payees_${year}.csv`, toCsv([
        ["Payee", "Kind", "Paid by bank/other", "Paid by card", "Total", "1099 tracked", "Needs 1099-NEC", "Address on file"],
        ...r.rows.map((x) => [x.name, x.kind, centsToPlain(x.reportable), centsToPlain(x.card), centsToPlain(x.total),
          x.track1099 ? "yes" : "", x.needs1099 ? "yes" : "", x.hasAddress ? "yes" : "no"]),
      ]))}>
        <Download className="h-4 w-4" /> Download list
      </button>
      <table className="w-full">
        <thead>
          <tr className="text-left text-text-muted">
            <th className="py-1">Payee</th><th className="text-right">Bank / other</th><th className="text-right">Card</th><th className="text-center">1099</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {r.rows.map((x) => (
            <tr key={x._id} className="border-t border-surface-border">
              <td className="py-1">{x.name} <span className="text-xs text-text-muted">{x.kind}</span></td>
              <td className="text-right font-mono">{formatCents(x.reportable)}</td>
              <td className="text-right font-mono text-text-muted">{formatCents(x.card)}</td>
              <td className="text-center">
                <input type="checkbox" checked={x.track1099} onChange={(ev) => setTrack({ id: x._id, track1099: ev.target.checked })} />
              </td>
              <td className={x.needs1099 ? "text-accent font-semibold" : "text-text-muted"}>
                {x.needs1099 ? `File 1099-NEC${x.hasAddress ? "" : " (need address/W-9)"}` : x.track1099 ? "Under threshold" : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Mileage({ year }: { year: number }) {
  const trips = useQuery(api.booksTax.listMileage, { year });
  const add = useMutation(api.booksTax.addMileage);
  const remove = useMutation(api.booksTax.removeMileage);
  const blank = { date: todayIso(), miles: "", purpose: "", from: "", to: "", contactId: "" };
  const [f, setF] = useState(blank);
  const [error, setError] = useState<string | null>(null);
  const total = (trips ?? []).reduce((s, t) => s + t.deduction, 0);
  const miles = (trips ?? []).reduce((s, t) => s + t.miles, 0);
  return (
    <>
      <form className={`${card} grid sm:grid-cols-6 gap-3 text-sm`} onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        try {
          await add({
            date: f.date, miles: Number(f.miles), purpose: f.purpose,
            from: f.from || undefined, to: f.to || undefined,
            contactId: (f.contactId || undefined) as Id<"booksContacts"> | undefined,
          });
          setF({ ...blank, date: f.date });
        } catch (err) {
          setError(errorText(err));
        }
      }}>
        <h2 className="sm:col-span-6 font-display font-semibold text-text">Log a business trip</h2>
        <input type="date" className={input} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
        <input className={`${input} text-right`} inputMode="decimal" placeholder="Miles" value={f.miles} onChange={(e) => setF({ ...f, miles: e.target.value })} />
        <input className={`${input} sm:col-span-2`} placeholder="Business purpose (e.g. client meeting)" value={f.purpose} onChange={(e) => setF({ ...f, purpose: e.target.value })} />
        <input className={input} placeholder="From" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} />
        <input className={input} placeholder="To" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} />
        <div className="sm:col-span-2"><ContactSelect value={f.contactId} onChange={(v) => setF({ ...f, contactId: v })} placeholder="Client (optional)" /></div>
        <div className="sm:col-span-4 flex items-center gap-3">
          <button className={btn} disabled={!f.miles || !f.purpose.trim()}>Add trip</button>
          <span className="text-text-muted">Rate on this date: {(mileageRate(f.date || todayIso()) / 10).toFixed(1)}¢/mile</span>
          {error && <span className="text-accent">{error}</span>}
        </div>
      </form>
      <section className={card}>
        {trips && trips.length > 0 && (
          <button className={`${btnGhost} float-right`} onClick={() => downloadText(`sira-books-mileage_${year}.csv`, toCsv([
            ["Date", "Miles", "Business purpose", "From", "To", "Rate (cents/mile)", "Deduction"],
            ...trips.slice().reverse().map((t) => [t.date, t.miles, t.purpose, t.from ?? "", t.to ?? "", (mileageRate(t.date) / 10).toFixed(1), centsToPlain(t.deduction)]),
            ["Total", miles.toFixed(1), "", "", "", "", centsToPlain(total)],
          ]))}>
            <Download className="h-4 w-4" /> Download log
          </button>
        )}
        <p className="text-sm mb-2">{year}: <b>{miles.toFixed(1)} miles</b> · deduction <b className="font-mono">{formatCents(total)}</b> (goes on Schedule C line 9)</p>
        {trips === undefined ? <p className="text-sm text-text-muted">Loading…</p> : trips.length === 0 ? (
          <p className="text-sm text-text-muted">No trips logged for {year}.</p>
        ) : (
          <ul className="divide-y divide-surface-border text-sm">
            {trips.map((t) => (
              <li key={t._id} className="flex items-center gap-3 py-1.5">
                <span className="font-mono text-text-muted w-24">{t.date}</span>
                <span className="font-mono w-16 text-right">{t.miles}</span>
                <span className="flex-1">{t.purpose}{t.from || t.to ? <span className="text-text-muted"> · {t.from ?? "?"} → {t.to ?? "?"}</span> : null}</span>
                <span className="font-mono">{formatCents(t.deduction)}</span>
                <button className="text-text-muted hover:text-accent" title="Delete" onClick={() => remove({ id: t._id })}><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function Big({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div>
      <div className="text-xs text-text-muted">{label}</div>
      <div className={`font-mono text-lg ${strong ? "text-primary font-semibold" : "text-text"}`}>{formatCents(value)}</div>
    </div>
  );
}
