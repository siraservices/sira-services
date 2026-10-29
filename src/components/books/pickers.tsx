"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { TYPE_LABEL, input } from "./format";

type AccountType = "asset" | "liability" | "equity" | "income" | "expense";

/** Account dropdown, grouped by type. `types` limits the choices. */
export function AccountSelect({
  value,
  onChange,
  types,
  cashOnly,
  placeholder = "Account…",
  className = "",
}: {
  value: string;
  onChange: (id: string) => void;
  types?: AccountType[];
  cashOnly?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const accounts = useQuery(api.booksAccounts.list, {});
  const shown = (accounts ?? []).filter(
    (a) => (!types || types.includes(a.type)) && (!cashOnly || a.isCash),
  );
  const groups = (["asset", "liability", "equity", "income", "expense"] as AccountType[]).filter((t) =>
    shown.some((a) => a.type === t),
  );
  return (
    <select className={`${input} ${className}`} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {groups.map((t) => (
        <optgroup key={t} label={TYPE_LABEL[t]}>
          {shown
            .filter((a) => a.type === t)
            .map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
        </optgroup>
      ))}
    </select>
  );
}

export function ContactSelect({
  value,
  onChange,
  kind,
  placeholder = "Customer…",
  className = "",
}: {
  value: string;
  onChange: (id: string) => void;
  kind?: "customer" | "vendor" | "contractor" | "other";
  placeholder?: string;
  className?: string;
}) {
  const contacts = useQuery(api.booksContacts.list, kind ? { kind } : {});
  return (
    <select className={`${input} ${className}`} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {(contacts ?? []).map((c) => (
        <option key={c._id} value={c._id}>
          {c.name}
          {c.company ? ` (${c.company})` : ""}
        </option>
      ))}
    </select>
  );
}

export function errorText(err: unknown): string {
  if (err && typeof err === "object" && "data" in err && typeof (err as { data: unknown }).data === "string") {
    return (err as { data: string }).data;
  }
  const msg = err instanceof Error ? err.message : String(err);
  // Convex wraps server errors as "[CONVEX ...] Uncaught ConvexError: <message>\n..."
  const m = /ConvexError: ([^\n]+)/.exec(msg);
  return m ? m[1] : msg;
}
