import { centsToPlain, toCsv } from "../../../convex/booksLib";

export { centsToPlain, toCsv };

/** Save text as a file in the browser. */
export function downloadText(filename: string, text: string, type = "text/csv;charset=utf-8") {
  const blob = new Blob([type.startsWith("text/csv") ? "﻿" + text : text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
