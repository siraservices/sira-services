"use client";

import { useMutation, useQuery } from "convex/react";
import { useRef, useState } from "react";
import { Paperclip } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { btn, card, formatCents, input, toCents, todayIso } from "@/components/books/format";
import { AccountSelect, ContactSelect, errorText } from "@/components/books/pickers";

const MAX_BYTES = 10 * 1024 * 1024;

/** Upload files to Convex storage; returns their storage ids. */
async function uploadFiles(getUrl: () => Promise<string>, files: File[]) {
  const out: { storageId: Id<"_storage">; fileName: string }[] = [];
  for (const f of files) {
    if (f.size > MAX_BYTES) throw new Error(`${f.name} is over 10 MB.`);
    const url = await getUrl();
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": f.type || "application/octet-stream" }, body: f });
    if (!res.ok) throw new Error(`Upload failed for ${f.name}.`);
    const { storageId } = (await res.json()) as { storageId: Id<"_storage"> };
    out.push({ storageId, fileName: f.name });
  }
  return out;
}

export default function BooksExpensesPage() {
  const create = useMutation(api.booksExpenses.create);
  const generateUploadUrl = useMutation(api.booksExpenses.generateUploadUrl);
  const attach = useMutation(api.booksExpenses.attachReceipts);
  const discard = useMutation(api.booksExpenses.discardUploads);
  const recent = useQuery(api.booksExpenses.recent, { limit: 40 });

  const blank = { date: todayIso(), payee: "", contactId: "", amount: "", isRefund: false, paidFrom: "", category: "", memo: "" };
  const [f, setF] = useState(blank);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    let amount: number;
    try {
      amount = toCents(f.amount);
    } catch {
      return setError("Amount isn't a number.");
    }
    if (!f.paidFrom || !f.category) return setError("Pick where it was paid from and a category.");
    setBusy(true);
    let receipts: { storageId: Id<"_storage">; fileName: string }[] = [];
    try {
      receipts = await uploadFiles(() => generateUploadUrl({}), files);
      await create({
        date: f.date,
        payee: f.payee || undefined,
        contactId: (f.contactId || undefined) as Id<"booksContacts"> | undefined,
        amount: Math.abs(amount),
        isRefund: f.isRefund,
        paidFromAccountId: f.paidFrom as Id<"booksAccounts">,
        categoryAccountId: f.category as Id<"booksAccounts">,
        memo: f.memo || undefined,
        receipts,
      });
      setF({ ...blank, paidFrom: f.paidFrom, date: f.date });
      setFiles([]);
      if (fileInput.current) fileInput.current.value = "";
    } catch (err) {
      setError(errorText(err));
      if (receipts.length) discard({ storageIds: receipts.map((r) => r.storageId) }).catch(() => {});
    } finally {
      setBusy(false);
    }
  };

  const addReceipt = async (entryId: Id<"booksEntries">, list: FileList | null) => {
    if (!list?.length) return;
    let receipts: { storageId: Id<"_storage">; fileName: string }[] = [];
    try {
      receipts = await uploadFiles(() => generateUploadUrl({}), Array.from(list));
      await attach({ entryId, receipts });
    } catch (err) {
      alert(errorText(err));
      if (receipts.length) discard({ storageIds: receipts.map((r) => r.storageId) }).catch(() => {});
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className={`${card} grid sm:grid-cols-3 gap-3`}>
        <h2 className="sm:col-span-3 font-display font-semibold text-text">Add an expense</h2>
        <label className="text-sm">
          <span className="block text-text-muted mb-1">Date</span>
          <input type="date" className={input} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
        </label>
        <label className="text-sm">
          <span className="block text-text-muted mb-1">Payee</span>
          <input className={input} placeholder="e.g. Anthropic" value={f.payee} onChange={(e) => setF({ ...f, payee: e.target.value })} />
        </label>
        <label className="text-sm">
          <span className="block text-text-muted mb-1">Contractor / vendor (optional, for 1099s)</span>
          <ContactSelect value={f.contactId} onChange={(v) => setF({ ...f, contactId: v })} placeholder="None" />
        </label>
        <label className="text-sm">
          <span className="block text-text-muted mb-1">Amount</span>
          <input className={`${input} text-right`} inputMode="decimal" placeholder="0.00" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
          <span className="flex items-center gap-2 mt-1 text-xs text-text-muted">
            <input type="checkbox" checked={f.isRefund} onChange={(e) => setF({ ...f, isRefund: e.target.checked })} /> This is a refund
          </span>
        </label>
        <label className="text-sm">
          <span className="block text-text-muted mb-1">Paid from</span>
          <AccountSelect value={f.paidFrom} onChange={(v) => setF({ ...f, paidFrom: v })} cashOnly placeholder="Bank or card…" />
        </label>
        <label className="text-sm">
          <span className="block text-text-muted mb-1">Category</span>
          <AccountSelect value={f.category} onChange={(v) => setF({ ...f, category: v })} types={["expense", "equity", "asset"]} placeholder="Category…" />
        </label>
        <input className={`${input} sm:col-span-2`} placeholder="Memo (optional)" value={f.memo} onChange={(e) => setF({ ...f, memo: e.target.value })} />
        <label className="text-sm flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-text-muted" />
          <input ref={fileInput} type="file" multiple accept="image/*,application/pdf"
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
        </label>
        <div className="sm:col-span-3 flex items-center gap-3">
          <button className={btn} disabled={busy}>{busy ? "Saving…" : "Save expense"}</button>
          {error && <p className="text-sm text-accent">{error}</p>}
        </div>
      </form>

      <section className={card}>
        <h2 className="font-display font-semibold text-text mb-3">Recent expenses and bank postings</h2>
        {recent === undefined ? <p className="text-sm text-text-muted">Loading…</p> : recent.length === 0 ? (
          <p className="text-sm text-text-muted">Nothing yet.</p>
        ) : (
          <ul className="divide-y divide-surface-border text-sm">
            {recent.map((e) => (
              <li key={e._id} className="py-2 flex flex-wrap items-center gap-3">
                <span className="font-mono text-text-muted w-24">{e.date}</span>
                <span className="flex-1 min-w-[200px]">{e.memo}</span>
                <span className="font-mono">{formatCents(e.total)}</span>
                <span className="flex items-center gap-2">
                  {e.receipts.map((r) =>
                    r.url ? (
                      <a key={r._id} href={r.url} target="_blank" rel="noreferrer" className="text-xs text-primary underline">
                        {r.fileName}
                      </a>
                    ) : null,
                  )}
                  <label className="text-xs text-text-muted cursor-pointer hover:text-text">
                    + receipt
                    <input type="file" className="hidden" multiple accept="image/*,application/pdf"
                      onChange={(ev) => addReceipt(e._id, ev.target.files)} />
                  </label>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
