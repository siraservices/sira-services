/**
 * Tests for Homepage — covers all 9 Phase 2 requirements + Phase 3 ConversionSection
 * HERO-01, HERO-02, HERO-03, SRVC-01, SRVC-02, PRUF-01, PRUF-02, PRUF-03, CTA-01
 * LEAD-01, LEAD-02, LEAD-03, LEAD-04, BOOK-01, BOOK-02
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "@/app/page";

// Mock next/link
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

// Mock lucide-react icons used in section components
jest.mock("lucide-react", () => ({
  Network: () => <span data-testid="icon-network">Network</span>,
  Database: () => <span data-testid="icon-database">Database</span>,
  Eye: () => <span data-testid="icon-eye">Eye</span>,
  Menu: () => <span data-testid="icon-menu">Menu</span>,
  X: () => <span data-testid="icon-x">X</span>,
  LogOut: () => <span data-testid="icon-logout">LogOut</span>,
  User: () => <span data-testid="icon-user">User</span>,
  Calendar: () => <span data-testid="icon-calendar">Calendar</span>,
  CheckCircle: () => <span data-testid="icon-check-circle">CheckCircle</span>,
  ChevronRight: () => <span data-testid="icon-chevron-right">ChevronRight</span>,
  Check: () => <span data-testid="icon-check">Check</span>,
  ArrowLeft: () => <span data-testid="icon-arrow-left">ArrowLeft</span>,
  ArrowRight: () => <span data-testid="icon-arrow-right">ArrowRight</span>,
}));

// Mock convex/react for ConversionSection
const mockSubmitLead = jest.fn();
jest.mock("convex/react", () => ({
  useMutation: jest.fn(() => mockSubmitLead),
  useQuery: jest.fn(() => undefined),
}));

// Mock the Convex generated API
jest.mock("../../convex/_generated/api", () => ({
  api: { leads: { submit: "leads:submit" } },
}));

describe("Homepage", () => {
  beforeEach(() => {
    render(<Home />);
  });

  // HERO-01: page renders an h1 heading element
  it("HERO-01: renders an h1 heading element with outcome-focused headline", () => {
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  // HERO-02: page renders a paragraph with supporting subtext
  it("HERO-02: renders supporting subtext paragraph with key business/AI phrases", () => {
    // HeroSection has a <p> with text about growth-stage companies and AI integration
    const subtext = screen.getByText(/growth-stage companies/i);
    expect(subtext).toBeInTheDocument();
  });

  // HERO-03: hero renders an "AM I QUALIFIED?" CTA button that opens the intake modal
  it("HERO-03: renders an AM I QUALIFIED? CTA button in the hero section", () => {
    const ctaButton = screen.getByRole("button", { name: /am i qualified\?/i });
    expect(ctaButton).toBeInTheDocument();
  });

  // SRVC-01: page renders exactly 3 service card titles
  it("SRVC-01: renders all 3 service card titles", () => {
    expect(
      screen.getByText("AI Integration & Agent Orchestration")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Data Pipeline Implementation")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Custom Computer Vision Systems")
    ).toBeInTheDocument();
  });

  // SRVC-02: page renders description text for each service
  it("SRVC-02: renders description text for each service card", () => {
    // Each card has a benefit-oriented description paragraph
    expect(screen.getByText(/coordinated AI agent systems/i)).toBeInTheDocument();
    expect(screen.getByText(/reliable automated workflows/i)).toBeInTheDocument();
    expect(screen.getByText(/visual inspection/i)).toBeInTheDocument();
  });

  // PRUF-01: Jesse Batt testimonial
  it("PRUF-01: renders Jesse Batt testimonial containing '100% recommend'", () => {
    expect(screen.getByText(/100% recommend/i)).toBeInTheDocument();
  });

  // PRUF-02: Kerry Johnson testimonial
  it("PRUF-02: renders Kerry Johnson testimonial containing 'punctual and eager to learn'", () => {
    expect(screen.getByText(/punctual and eager to learn/i)).toBeInTheDocument();
  });

  // PRUF-03: Daniel testimonial
  it("PRUF-03: renders Daniel testimonial containing 'qualifying questions'", () => {
    expect(screen.getByText(/qualifying questions/i)).toBeInTheDocument();
  });

  // CTA-01: at least 2 "AM I QUALIFIED?" buttons (Hero + CtaBanner) triggering the intake modal
  it("CTA-01: renders at least 2 AM I QUALIFIED? CTA buttons across the page", () => {
    const qualifyButtons = screen.getAllByRole("button", { name: /am i qualified\?/i });
    expect(qualifyButtons.length).toBeGreaterThanOrEqual(2);
  });
});

describe("ConversionSection", () => {
  beforeEach(() => {
    mockSubmitLead.mockReset();
    render(<Home />);
  });

  // LEAD-01: form renders all 4 fields
  it("LEAD-01: renders name, email, company, and project description fields", () => {
    expect(screen.getByPlaceholderText("Your full name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@company.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your company name")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        "What problem are you trying to solve? What does success look like?"
      )
    ).toBeInTheDocument();
  });

  // LEAD-02: submitting with empty required fields shows inline errors
  it("LEAD-02: shows inline error messages when required fields are empty on submit", async () => {
    const user = userEvent.setup();
    const submitButton = screen.getByRole("button", { name: /send message/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
      expect(screen.getByText("Email is required")).toBeInTheDocument();
      expect(screen.getByText("Please describe your project")).toBeInTheDocument();
    });
  });

  // LEAD-03: filling and submitting calls mutation with correct args
  it("LEAD-03: calls Convex mutation with correct args including source: 'homepage'", async () => {
    const user = userEvent.setup();
    mockSubmitLead.mockResolvedValue(undefined);

    await user.type(screen.getByPlaceholderText("Your full name"), "Test User");
    await user.type(screen.getByPlaceholderText("you@company.com"), "test@example.com");
    await user.type(
      screen.getByPlaceholderText(
        "What problem are you trying to solve? What does success look like?"
      ),
      "Test project"
    );

    const submitButton = screen.getByRole("button", { name: /send message/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSubmitLead).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Test User",
          email: "test@example.com",
          message: "Test project",
          source: "homepage",
        })
      );
    });
  });

  // LEAD-04: success message replaces form after successful submission
  it("LEAD-04: shows success message after successful form submission", async () => {
    const user = userEvent.setup();
    mockSubmitLead.mockResolvedValue(undefined);

    await user.type(screen.getByPlaceholderText("Your full name"), "Test User");
    await user.type(screen.getByPlaceholderText("you@company.com"), "test@example.com");
    await user.type(
      screen.getByPlaceholderText(
        "What problem are you trying to solve? What does success look like?"
      ),
      "Test project"
    );

    const submitButton = screen.getByRole("button", { name: /send message/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/we'll be in touch/i)).toBeInTheDocument();
    });
  });

  // BOOK-01: booking CTA has target="_blank" and rel containing "noopener"
  it("BOOK-01: booking CTA link has target='_blank' and rel containing 'noopener'", () => {
    // The ConversionSection CTA is a real anchor with target="_blank" (not next/link)
    const allBookingLinks = screen.getAllByRole("link", { name: /book a consultation/i });
    const ctaLink = allBookingLinks.find((link) => link.getAttribute("target") === "_blank");
    expect(ctaLink).toBeDefined();
    expect(ctaLink).toHaveAttribute("target", "_blank");
    expect(ctaLink).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  // BOOK-02: booking CTA is visually primary (bg-cta), form submit is ghost/outline (no bg-cta)
  it("BOOK-02: booking CTA has primary orange styling, form submit has ghost/outline styling", () => {
    const allBookingLinks = screen.getAllByRole("link", { name: /book a consultation/i });
    const ctaLink = allBookingLinks.find((link) => link.getAttribute("target") === "_blank");
    expect(ctaLink).toBeDefined();
    expect(ctaLink!.className).toContain("bg-cta");

    const submitButton = screen.getByRole("button", { name: /send message/i });
    expect(submitButton.className).not.toContain("bg-cta");
  });
});
