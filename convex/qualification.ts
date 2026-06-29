// Shared lead-qualification scoring. Pure logic with no Convex/server deps so it
// can be the single source of truth for both the submit mutation (convex/leads.ts)
// and the client intake modal (src/components/home/QualificationIntake.tsx).

export const HIGH_BUDGET = new Set(["$15k – $50k", "$50k+"]);
export const NEAR_TERM = new Set(["ASAP", "1 – 3 months"]);
export const MATURE_PROJECT = new Set([
  "PoC underway",
  "Production ready to scale",
  "Replacing an existing system",
]);

export type QualificationTier = "qualified" | "nurture";

export function computeTier(
  budget: string | undefined,
  timeline: string | undefined,
  projectMaturity: string | undefined
): QualificationTier {
  const score =
    (budget && HIGH_BUDGET.has(budget) ? 2 : 0) +
    (timeline && NEAR_TERM.has(timeline) ? 1 : 0) +
    (projectMaturity && MATURE_PROJECT.has(projectMaturity) ? 1 : 0);
  return score >= 2 ? "qualified" : "nurture";
}
