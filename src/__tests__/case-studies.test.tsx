/**
 * Tests for the case-studies listing and detail pages:
 * - cards show the cover image and the first two tags
 * - the category filter appears when both AI and website work exist
 * - the detail page renders the cover image and the "Visit live site" link
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CaseStudiesList } from "@/app/case-studies/CaseStudiesList";
import { CaseStudyContent } from "@/app/case-studies/[slug]/CaseStudyContent";
import type { Doc } from "../../convex/_generated/dataModel";

// The generated Convex API is ESM; the mocked `useQuery` ignores its argument.
jest.mock("../../convex/_generated/api", () => ({
  api: {
    caseStudies: {
      listPublished: "caseStudies:listPublished",
      getBySlug: "caseStudies:getBySlug",
    },
  },
}));

jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

jest.mock("lucide-react", () => ({
  ArrowRight: () => <span>→</span>,
  ArrowLeft: () => <span>←</span>,
  ArrowUpRight: () => <span>↗</span>,
  Building2: () => <span>🏢</span>,
  Target: () => <span>◎</span>,
  Lightbulb: () => <span>💡</span>,
  TrendingUp: () => <span>📈</span>,
}));

const now = Date.now();

function study(
  overrides: Partial<Doc<"caseStudies">> & { slug: string; tags: string[] },
): Doc<"caseStudies"> {
  return {
    _id: `id_${overrides.slug}` as Doc<"caseStudies">["_id"],
    _creationTime: now,
    title: `Title ${overrides.slug}`,
    client: `Client ${overrides.slug}`,
    description: "Description",
    challenge: "Challenge",
    solution: "Solution",
    results: "Results",
    published: true,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

const poker = study({
  slug: "poker",
  tags: ["computer-vision", "opencv", "python"],
  imageUrl: "/images/case-studies/real-time-poker-computer-vision.jpg",
});
const site = study({
  slug: "eatpmp",
  tags: ["website", "shopify", "maintenance"],
  imageUrl: "/images/case-studies/performance-meal-prep.jpg",
  liveUrl: "https://www.eatpmp.com/",
});
const inProgress = study({
  slug: "rowhome",
  tags: ["website", "in-progress", "wordpress"],
});

describe("CaseStudiesList", () => {
  it("renders cover images and the first two tags on each card", () => {
    render(<CaseStudiesList initialCaseStudies={[poker, site]} />);
    const img = screen.getByAltText(poker.title) as HTMLImageElement;
    expect(img.src).toContain("/images/case-studies/real-time-poker-computer-vision.jpg");
    expect(screen.getByText("website")).toBeInTheDocument();
    expect(screen.getByText("shopify")).toBeInTheDocument();
    expect(screen.queryByText("maintenance")).not.toBeInTheDocument();
  });

  it("shows the filter only when both AI and website studies exist", () => {
    const { rerender } = render(<CaseStudiesList initialCaseStudies={[poker]} />);
    expect(screen.queryByRole("tab", { name: "Websites" })).not.toBeInTheDocument();

    rerender(<CaseStudiesList initialCaseStudies={[poker, site, inProgress]} />);
    expect(screen.getByRole("tab", { name: "Websites" })).toBeInTheDocument();
  });

  it("filters cards by category", async () => {
    const user = userEvent.setup();
    render(<CaseStudiesList initialCaseStudies={[poker, site, inProgress]} />);

    expect(screen.getAllByRole("link", { name: /Title/ })).toHaveLength(3);

    await user.click(screen.getByRole("tab", { name: "Websites" }));
    const websites = screen.getAllByRole("link", { name: /Title/ });
    expect(websites).toHaveLength(2);
    expect(screen.queryByText(poker.title)).not.toBeInTheDocument();
    expect(screen.getByText("in-progress")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "AI & computer vision" }));
    expect(screen.getAllByRole("link", { name: /Title/ })).toHaveLength(1);
    expect(screen.getByText(poker.title)).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "All" }));
    expect(screen.getAllByRole("link", { name: /Title/ })).toHaveLength(3);
  });
});

describe("CaseStudyContent", () => {
  it("renders the cover image and a link to the live site", () => {
    render(<CaseStudyContent slug={site.slug} initialCaseStudy={site} />);

    const img = screen.getByRole("img") as HTMLImageElement;
    expect(img.src).toContain("/images/case-studies/performance-meal-prep.jpg");

    const live = screen.getByRole("link", { name: /Visit live site/ });
    expect(live).toHaveAttribute("href", "https://www.eatpmp.com/");
    expect(live).toHaveAttribute("target", "_blank");
    expect(live).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("omits the image and live link when the study has neither", () => {
    render(<CaseStudyContent slug={inProgress.slug} initialCaseStudy={inProgress} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Visit live site/ })).not.toBeInTheDocument();
    expect(screen.getByText("in-progress")).toBeInTheDocument();
  });
});
