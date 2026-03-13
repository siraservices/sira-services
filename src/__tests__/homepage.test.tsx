/**
 * Tests for Homepage — covers all 9 Phase 2 requirements
 * HERO-01, HERO-02, HERO-03, SRVC-01, SRVC-02, PRUF-01, PRUF-02, PRUF-03, CTA-01
 */
import React from "react";
import { render, screen } from "@testing-library/react";
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
  Brain: () => <span data-testid="icon-brain">Brain</span>,
  Database: () => <span data-testid="icon-database">Database</span>,
  Eye: () => <span data-testid="icon-eye">Eye</span>,
  Menu: () => <span data-testid="icon-menu">Menu</span>,
  X: () => <span data-testid="icon-x">X</span>,
  LogOut: () => <span data-testid="icon-logout">LogOut</span>,
  User: () => <span data-testid="icon-user">User</span>,
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
    // HeroSection has a <p> with text about business/AI/consultation
    const subtext = screen.getByText(/business/i);
    expect(subtext).toBeInTheDocument();
  });

  // HERO-03: page renders a link with "Book a Consultation" and href containing "#booking"
  it("HERO-03: renders a Book a Consultation CTA link pointing to #booking", () => {
    const ctaLinks = screen.getAllByRole("link", { name: /book a consultation/i });
    expect(ctaLinks.length).toBeGreaterThan(0);
    const heroCtaLink = ctaLinks[0];
    expect(heroCtaLink).toHaveAttribute("href", expect.stringContaining("#booking"));
  });

  // SRVC-01: page renders exactly 3 service card titles
  it("SRVC-01: renders all 3 service card titles", () => {
    expect(
      screen.getByText("AI Consulting & Strategy")
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
    expect(screen.getByText(/actionable AI roadmap/i)).toBeInTheDocument();
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

  // CTA-01: at least 2 elements with href="#booking" (Hero CTA + CTA Banner)
  it("CTA-01: renders at least 2 Book a Consultation links with href='#booking'", () => {
    const ctaLinks = screen.getAllByRole("link", { name: /book a consultation/i });
    expect(ctaLinks.length).toBeGreaterThanOrEqual(2);
    ctaLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", expect.stringContaining("#booking"));
    });
  });
});
