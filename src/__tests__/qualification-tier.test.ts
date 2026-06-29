/**
 * Tests for convex/qualification.ts — exercises both qualificationTier values
 * and confirms the scoring thresholds match the acceptance criteria in SIR-2244.
 */
import { computeTier } from "../../convex/qualification";

describe("computeTier — qualified path", () => {
  it("returns 'qualified' for $50k+ budget alone (score = 2)", () => {
    expect(computeTier("$50k+", undefined, undefined)).toBe("qualified");
  });

  it("returns 'qualified' for $15k–$50k budget alone (score = 2)", () => {
    expect(computeTier("$15k – $50k", undefined, undefined)).toBe("qualified");
  });

  it("returns 'qualified' for $50k+ + ASAP + mature project (score = 4)", () => {
    expect(computeTier("$50k+", "ASAP", "PoC underway")).toBe("qualified");
  });

  it("returns 'qualified' for $15k–$50k + 1–3 months (score = 3)", () => {
    expect(computeTier("$15k – $50k", "1 – 3 months", undefined)).toBe("qualified");
  });

  it("returns 'qualified' for $50k+ + distant timeline + immature project (score = 2)", () => {
    expect(computeTier("$50k+", "6+ months", "Just an idea")).toBe("qualified");
  });
});

describe("computeTier — nurture path", () => {
  it("returns 'nurture' when all args are undefined (score = 0)", () => {
    expect(computeTier(undefined, undefined, undefined)).toBe("nurture");
  });

  it("returns 'nurture' for low budget + exploring + idea (score = 0)", () => {
    // $0–$5k: 0, "Exploring options": 0, "Just an idea": 0 → score 0
    expect(computeTier("$0 – $5k", "Exploring options", "Just an idea")).toBe("nurture");
  });

  it("returns 'nurture' for $5k–$15k + near-term + immature project (score = 0+1+0 = 1)", () => {
    expect(computeTier("$5k – $15k", "1 – 3 months", "Just an idea")).toBe("nurture");
  });

  it("returns 'nurture' for 'Need help scoping' + 6+ months + no maturity (score = 0)", () => {
    expect(computeTier("Need help scoping", "6+ months", undefined)).toBe("nurture");
  });

  it("returns 'nurture' for $5k–$15k + ASAP + requirements doc (score = 0+1+0 = 1)", () => {
    // budget below threshold scores 0, so near-term alone (1) stays under the qualified cutoff
    expect(computeTier("$5k – $15k", "ASAP", "Have a requirements doc")).toBe("nurture");
  });
});
