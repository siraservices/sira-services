"use client";

import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { Check, Link2, Undo2, X } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { parseBankCsv, type BankRow } from "../../../../../convex/booksOpsLib";
import { btn, btnGhost, card, formatCents, input, todayIso } from "@/components/books/format";
import { AccountSelect, errorText } from "@/components/books/pickers";

type Tab = "pending" | "posted" | "matched" | "excluded";

export default function BooksBankPage() {
  const accounts = useQuery(api.booksAccounts.list, {});
  const counts = useQuery(api.booksBank.counts, {});
  const cash = (accounts ?? []).filter((a) => a.isCash);
  const [accountId, setAccountId] = useState("");
  const [tab, setTab] = useState<Tab>("pending");
  useEffect(() => {
    if (!accountId && cash.length) setAccountId(cash.find((a) => a.name.includes("Checking"))?._id ?? cash[0]._id);
  }, [accountId, cash]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {cash.map((a) => (
          <button key={a._id} onClick={() => setAccountId(a._id)}
            className={`px-3 py-1.5 rounded-lg text-sm border ${accountId === a._id ? "bg-primary text-white border-primary" : "border-surface-border text-text"}`}>
            {a.name}
            {counts?.[a._id] ? <span className="ml-2 text-xs opacity-80">{counts[a._id]} to review</span> : null}
          </button>
        ))}
        {accounts && cash.length === 0 && (
          <p className="text-sm text-text-muted">Mark your bank and card accounts as “cash” on the Accounts page first.</p>
        )}
      </div>
      {accountId && (
        <>
          <Upload accountId={accountId as Id<"booksAccounts">} />
          <div className="flex gap-1">
            {(["pending", "posted", "matched", "excluded"] as Tab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-sm ${tab === t ? "bg-surface-muted text-text font-semibold" : "text-text-muted"}`}>
                {t === "pending" ? "For review" : t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <Queue accountId={accountId as Id<"booksAccounts">} tab={tab} />
          <Rules />
        </>
      )}
    </div>
  );
}

function Upload({ accountId }: { accountId: Id<"booksAccounts"> }) {
  const importRows = useMutation(api.booksBank.importRows);
  const [parsed, setParsed] = useState<{ rows: BankRow[]; errors: string[]; format: string } | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onFile = async (f?: File) => {
    setMsg(null);
    if (!f) return setParsed(null);
    setParsed(parseBankCsv(await f.text()));
  };

  const run = async () => {
    if (!parsed) return;
    setBusy(true);
    let added = 0;
    let skipped = 0;
    try {
      for (let i = 0; i < parsed.rows.length; i += 400) {
        const r = await importRows({ accountId, rows: parsed.rows.slice(i, i + 400) });
        added += r.added;
        skipped += r.skipped;
      }
      setMsg(`${added} new rows to review, ${skipped} already imported.`);
      setParsed(null);
    } catch (err) {
      setMsg(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={card}>
      <h2 className="font-display font-semibold text-text mb-1">Import bank transactions</h2>
      <p className="text-sm text-text-muted mb-3">
        In Chase, open the account, click the download icon, pick CSV and a date range. Importing the same dates
        twice is safe.
      </p>
      <input type="file" accept=".csv,text/csv" onChange={(e) => onFile(e.target.files?.[0])} />
      {parsed && (
        <div className="mt-3 text-sm">
          <p>
            {parsed.format}: {parsed.rows.length} transactions
            {parsed.rows.length > 0 && `, ${parsed.rows[0].date} to ${parsed.rows[parsed.rows.length - 1].date}`}
          </p>
          {parsed.errors.length > 0 && (
            <ul className="text-xs text-accent mt-1 max-h-32 overflow-auto">{parsed.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
          )}
          <button className={`${btn} mt-2`} disabled={busy || parsed.rows.length === 0} onClick={run}>
            {busy ? "Importing…" : "Add to review"}
          </button>
        </div>
      )}
      {msg && <p className="text-sm mt-2">{msg}</p>}
    </section>
  );
}

function Queue({ accountId, tab }: { accountId: Id<"booksAccounts">; tab: Tab }) {
  const rows = useQuery(api.booksBank.review, { accountId, status: tab });
  const post = useMutation(api.booksBank.post);
  const postMany = useMutation(api.booksBank.postMany);
  const match = useMutation(api.booksBank.match);
  const exclude = useMutation(api.booksBank.exclude);
  const undo = useMutation(api.booksBank.undo);
  const [choice, setChoice] = useState<Record<string, string>>({});
  const [ruleFor, setRuleFor] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const categoryOf = (r: { _id: string; suggestedAccountId: string | null }) => choice[r._id] ?? r.suggestedAccountId ?? "";
  const ready = useMemo(
    () => (rows ?? []).filter((r) => tab === "pending" && r.matches.length === 0 && (choice[r._id] ?? r.suggestedAccountId)),
    [rows, choice, tab],
  );

  const act = async (fn: () => Promise<unknown>) => {
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(errorText(err));
    }
  };

  if (rows === undefined) return <p className="text-sm text-text-muted">Loading…</p>;
  if (rows.length === 0) return <p className={`${card} text-sm text-text-muted`}>{tab === "pending" ? "Nothing to review." : "Nothing here."}</p>;

  return (
    <section className={card}>
      {tab === "pending" && ready.length > 0 && (
        <div className="flex items-center gap-3 mb-3">
          <button className={btn} onClick={() =>
            act(() => postMany({ items: ready.slice(0, 100).map((r) => ({
              id: r._id,
              categoryAccountId: categoryOf(r) as Id<"booksAccounts">,
              contactId: !choice[r._id] && r.suggestedContactId ? r.suggestedContactId : undefined,
            })) }))}>
            <Check className="h-4 w-4" /> Post {Math.min(ready.length, 100)} with a category
          </button>
          <span className="text-xs text-text-muted">Rows that look like something already in your books aren’t included; match those one by one.</span>
        </div>
      )}
      {error && <p className="text-sm text-accent mb-2">{error}</p>}
      <ul className="divide-y divide-surface-border">
        {rows.map((r) => (
          <li key={r._id} className="py-3 text-sm space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-text-muted w-24">{r.date}</span>
              <span className="flex-1 min-w-[220px] text-text">{r.description}</span>
              <span className={`font-mono w-28 text-right ${r.amount > 0 ? "text-primary" : ""}`}>{formatCents(r.amount)}</span>
            </div>
            {tab === "pending" ? (
              <div className="flex flex-wrap items-center gap-2 pl-0 sm:pl-28">
                {r.matches.map((m) => (
                  <button key={m.entryId} className={btnGhost} title="Already in your books: link instead of posting again"
                    onClick={() => act(() => match({ id: r._id, entryId: m.entryId as Id<"booksEntries"> }))}>
                    <Link2 className="h-4 w-4" /> Match {m.date} {m.memo ? `· ${m.memo.slice(0, 40)}` : ""}
                  </button>
                ))}
                <AccountSelect className="w-auto min-w-[220px]" value={categoryOf(r)}
                  onChange={(v) => setChoice({ ...choice, [r._id]: v })} placeholder="Category…" />
                <input className={`${input} w-40`} placeholder="Rule: contains…" value={ruleFor[r._id] ?? ""}
                  onChange={(e) => setRuleFor({ ...ruleFor, [r._id]: e.target.value })} title="Save a rule so this description gets this category next time" />
                <button className={btn} disabled={!categoryOf(r)}
                  onClick={() => act(() => post({
                    id: r._id,
                    categoryAccountId: categoryOf(r) as Id<"booksAccounts">,
                    contactId: !choice[r._id] && r.suggestedContactId ? r.suggestedContactId : undefined,
                    ruleText: ruleFor[r._id] || undefined,
                  }))}>
                  Post
                </button>
                <button className="text-text-muted hover:text-accent" title="Exclude (duplicate or not business)"
                  onClick={() => act(() => exclude({ id: r._id }))}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="pl-0 sm:pl-28">
                <button className="text-xs text-text-muted hover:text-text inline-flex items-center gap-1"
                  onClick={() => {
                    if (tab === "posted" && !confirm("Send back to review? The posted entry is reversed today.")) return;
                    act(() => undo({ id: r._id, date: todayIso() }));
                  }}>
                  <Undo2 className="h-3 w-3" /> Back to review
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Rules() {
  const rules = useQuery(api.booksBank.listRules, {});
  const accounts = useQuery(api.booksAccounts.list, {});
  const create = useMutation(api.booksBank.createRule);
  const remove = useMutation(api.booksBank.deleteRule);
  const [contains, setContains] = useState("");
  const [acct, setAcct] = useState("");
  const [error, setError] = useState<string | null>(null);
  const names = new Map((accounts ?? []).map((a) => [a._id as string, a.name]));

  return (
    <section className={card}>
      <h2 className="font-display font-semibold text-text mb-1">Rules</h2>
      <p className="text-sm text-text-muted mb-3">If a description contains the text, the category is filled in for you.</p>
      <form className="flex flex-wrap gap-2 mb-3" onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        try {
          await create({ contains, accountId: acct as Id<"booksAccounts"> });
          setContains("");
        } catch (err) {
          setError(errorText(err));
        }
      }}>
        <input className={`${input} w-48`} placeholder="e.g. upwork" value={contains} onChange={(e) => setContains(e.target.value)} />
        <AccountSelect className="w-auto min-w-[240px]" value={acct} onChange={setAcct} placeholder="Category…" />
        <button className={btnGhost} disabled={!contains.trim() || !acct}>Add rule</button>
        {error && <p className="text-sm text-accent">{error}</p>}
      </form>
      <ul className="divide-y divide-surface-border text-sm">
        {(rules ?? []).map((r) => (
          <li key={r._id} className="flex items-center gap-3 py-1.5">
            <span className="font-mono flex-1">“{r.contains}”</span>
            <span className="text-text-muted">→ {names.get(r.accountId) ?? "?"}</span>
            <button className="text-xs text-accent" onClick={() => remove({ id: r._id })}>Remove</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
