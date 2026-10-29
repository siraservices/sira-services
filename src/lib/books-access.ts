import { BOOKS_OWNER_EMAIL, normEmail } from "../../convex/booksLib";

/**
 * Emails allowed past the /admin/books page guard. Always the owner, plus any
 * extra addresses in BOOKS_EXTRA_EMAILS (comma-separated) for people Julio
 * invites. Convex still checks booksMembers on every call.
 */
export function booksEmailAllowed(email: string | undefined | null, verified: boolean | undefined): boolean {
  if (!verified) return false;
  const e = normEmail(email);
  if (!e) return false;
  const extra = (process.env.BOOKS_EXTRA_EMAILS ?? "")
    .split(",")
    .map((x) => normEmail(x))
    .filter(Boolean);
  return e === BOOKS_OWNER_EMAIL || extra.includes(e);
}
