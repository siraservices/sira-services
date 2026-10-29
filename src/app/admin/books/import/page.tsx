"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../../../../convex/_generated/api";
import {
  parseQboAccounts,
  parseQboJournal,
  type ImportedAccount,
  type ImportedEntry,
} from "../../../../../convex/booksImportLib";
import { btn, card, formatCents } from "@/components/books/format";

const BATCH = 50;

export default function BooksImportPage() {
  const importAccounts = useMutation(api.booksImport.importAccounts);
  const importEntries = useMutation(api.booksImport.importEntries);

  const [accounts, setAccounts] = useState<ImportedAccount[] | null>(null);
  const [entries, setEntries] = useState<ImportedEntry[] | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const readFile = (file: File) => file.text();

  const onAccounts = async (f?: File) => {
    if (!f) return;
    const r = parseQboAccounts(await readFile(f));
    setAccounts(r.accounts);
    setParseErrors((e) => [...e.filter((x) => !x.startsWith("[accounts]")), ...r.errors.map((x) => `[accounts] ${x}`)]);
  };

  const onJournal = async (f?: File) => {
    if (!f) return;
    const r = parseQboJournal(await readFile(f));
    setEntries(r.entries);
    setParseErrors((e) => [...e.filter((x) => !x.startsWith("[journal]")), ...r.errors.map((x) => `[journal] ${x}`)]);
  };

  const good = entries?.filter((e) => !e.error) ?? [];
  const totalDebits = good.reduce((s, e) => s + e.lines.reduce((t, l) => t + l.debit, 0), 0);

  const run = async () => {
    setBusy(true);
    const out: string[] = [];
    try {
      if (accounts?.length) {
        const r = await importAccounts({ accounts });
        out.push(`Accounts: ${r.created} new.`);
        setLog([...out]);
      }
      let posted = 0;
      let skipped = 0;
      for (let i = 0; i < good.length; i += BATCH) {
        const batch = good.slice(i, i + BATCH).map((e) => ({
          date: e.date,
          txnType: e.txnType,
          num: e.num,
          memo: e.memo,
          sourceRef: e.sourceRef,
          lines: e.lines.map((l) => ({ accountName: l.accountName, debit: l.debit, credit: l.credit, memo: l.memo })),
        }));
        const r = await importEntries({ entries: batch });
        posted += r.posted;
        skipped += r.skipped;
        out.push(...r.errors);
        setLog([...out, `Entries: ${posted} posted, ${skipped} already there (${Math.min(i + BATCH, good.length)}/${good.length})`]);
      }
      out.push(`Done. ${posted} entries posted, ${skipped} skipped as duplicates.`);
    } catch (err) {
      out.push(`Stopped: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLog(out);
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className={card}>
        <h2 className="font-display font-semibold text-text mb-2">Import from QuickBooks</h2>
        <ol className="text-sm text-text-muted list-decimal ml-5 space-y-1 mb-4">
          <li>In QuickBooks, run <b>Reports → Account List</b> and export it as CSV.</li>
          <li>Run <b>Reports → Journal</b> for <b>All dates</b> and export it as CSV.</li>
          <li>Pick both files below, check the preview, then import. Running it twice won&apos;t double anything.</li>
        </ol>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="text-sm">
            <span className="block text-text-muted mb-1">Account List CSV</span>
            <input type="file" accept=".csv,text/csv" onChange={(e) => onAccounts(e.target.files?.[0])} />
          </label>
          <label className="text-sm">
            <span className="block text-text-muted mb-1">Journal CSV</span>
            <input type="file" accept=".csv,text/csv" onChange={(e) => onJournal(e.target.files?.[0])} />
          </label>
        </div>
      </section>

      {(accounts || entries) && (
        <section className={card}>
          <h2 className="font-display font-semibold text-text mb-2">Preview</h2>
          <ul className="text-sm text-text space-y-1">
            {accounts && <li>{accounts.length} accounts</li>}
            {entries && (
              <li>
                {good.length} entries ready ({formatCents(totalDebits)} in debits)
                {entries.length !== good.length && `, ${entries.length - good.length} with problems (skipped)`}
              </li>
            )}
            {good.length > 0 && <li className="text-text-muted">From {good[0].date} to {good[good.length - 1].date}</li>}
          </ul>
          {parseErrors.length > 0 && (
            <ul className="mt-3 text-xs text-accent space-y-0.5 max-h-48 overflow-auto">
              {parseErrors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
          <button className={`${btn} mt-4`} disabled={busy || (!accounts?.length && good.length === 0)} onClick={run}>
            {busy ? "Importing…" : "Import"}
          </button>
        </section>
      )}

      {log.length > 0 && (
        <section className={card}>
          <ul className="text-xs font-mono text-text space-y-0.5 max-h-64 overflow-auto">
            {log.map((l, i) => <li key={i}>{l}</li>)}
          </ul>
        </section>
      )}
    </div>
  );
}
