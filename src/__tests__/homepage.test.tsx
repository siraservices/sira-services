/**
 * Tests for Homepage — covers all 9 Phase 2 requirements + Phase 3 ConversionSection
 * HERO-01, HERO-02, HERO-03, SRVC-01, SRVC-02, PRUF-01, PRUF-02, PRUF-03, CTA-01
 * LEAD-01, LEAD-02, LEAD-03, LEAD-04, BOOK-01, BOOK-02
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { PillarsSection } from "@/components/home/PillarsSection";
import { ProtocolSection } from "@/components/home/ProtocolSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CtaBanner } from "@/components/home/CtaBanner";
import { ConversionSection } from "@/components/home/ConversionSection";

/**
 * The homepage without the async, Convex-backed "Selected work" section
 * (server components can't be rendered by RTL).
 */
function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <PillarsSection />
      <ProtocolSection />
      <ServicesSection />
      <TestimonialsSection />
      <CtaBanner />
      <ConversionSection />
    </div>
  );
}

// GSAP needs a real layout engine; stub it out under jsdom.
jest.mock("gsap", () => {
  const noop = () => ({ kill: () => {} });
  return {
    __esModule: true,
    default: {
      registerPlugin: () => {},
      context: (fn: () => void) => {
        fn();
        return { revert: () => {} };
      },
      from: noop,
      to: noop,
      set: () => {},
    },
  };
});
jest.mock("gsap/ScrollTrigger", () => ({ ScrollTrigger: { refresh: () => {} } }));

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
  ArrowUpRight: () => <span data-testid="icon-arrow-up-right">ArrowUpRight</span>,
  Hexagon: () => <span>Hexagon</span>,
  ScanLine: () => <span>ScanLine</span>,
  Cpu: () => <span>Cpu</span>,
  Layers: () => <span>Layers</span>,
  Activity: () => <span>Activity</span>,
  CalendarCheck: () => <span>CalendarCheck</span>,
  Quote: () => <span>Quote</span>,
  CheckCircle2: () => <span data-testid="icon-check-circle">CheckCircle2</span>,
  Clock: () => <span>Clock</span>,
  Mail: () => <span>Mail</span>,
  MapPin: () => <span>MapPin</span>,
  Brain: () => <span>Brain</span>,
  Cog: () => <span>Cog</span>,
  Globe: () => <span>Globe</span>,
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
    // HeroSection has a <p> positioning SIRA around production-grade ML/CV work
    const subtext = screen.getByText(/real, messy data/i);
    expect(subtext).toBeInTheDocument();
  });

  // HERO-03: hero renders a "Check project fit" button that opens the intake modal,
  // next to a primary "Book a free 30-min call" link that points at a real URL.
  it("HERO-03: renders the fit-check button and a working booking link in the hero", () => {
    const ctaButtons = screen.getAllByRole("button", { name: /check project fit/i });
    expect(ctaButtons.length).toBeGreaterThanOrEqual(1);

    const heroBooking = screen.getByRole("link", { name: /book a free 30-min call/i });
    expect(heroBooking.getAttribute("href")).toMatch(/^https:\/\//);
  });

  // SRVC-01: the services grid renders every service line from lib/services.
  // Service titles also appear as <select> options in the ConversionSection
  // form, so scope to the card headings to avoid ambiguity.
  it("SRVC-01: renders all 5 service card titles", () => {
    for (const title of [
      "Machine Learning Development",
      "Computer Vision Solutions",
      "AI Process Automation",
      "AI Integration & Agent Orchestration",
      "Websites & Maintenance",
    ]) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    }
  });

  // SRVC-02: each service card links to its detail page
  it("SRVC-02: service cards link to their detail pages", () => {
    const links = screen.getAllByRole("link").map((l) => l.getAttribute("href"));
    expect(links).toContain("/services/websites-and-maintenance");
    expect(links).toContain("/services/computer-vision-solutions");
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

  // CTA-01: at least 2 "Check project fit" buttons (Hero + CtaBanner) triggering the intake modal
  it("CTA-01: renders at least 2 Check project fit CTA buttons across the page", () => {
    const qualifyButtons = screen.getAllByRole("button", { name: /check project fit/i });
    expect(qualifyButtons.length).toBeGreaterThanOrEqual(2);
  });
});

describe("ConversionSection", () => {
  beforeEach(() => {
    mockSubmitLead.mockReset();
    render(<Home />);
  });

  // LEAD-01: form renders its fields. The SIR-2239 redesign replaced the free-text
  // "company" field with optional service-interest and budget selects; required
  // fields are name, email, and project description (see leadFormSchema / LEAD-03).
  it("LEAD-01: renders name, email, service interest, budget, and project description fields", () => {
    expect(screen.getByPlaceholderText("Your full name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@company.com")).toBeInTheDocument();
    expect(screen.getByLabelText(/^Service/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Approximate budget/i)).toBeInTheDocument();
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
      expect(screen.getByText(/message received/i)).toBeInTheDocument();
    });
  });

  // BOOK-01: booking CTA has target="_blank" and rel containing "noopener"
  it("BOOK-01: booking CTA link has target='_blank' and rel containing 'noopener'", () => {
    // The ConversionSection CTA is a real anchor with target="_blank" (not next/link)
    const allBookingLinks = screen.getAllByRole("link", { name: /book a free 30-minute call/i });
    const ctaLink = allBookingLinks.find((link) => link.getAttribute("target") === "_blank");
    expect(ctaLink).toBeDefined();
    expect(ctaLink).toHaveAttribute("target", "_blank");
    expect(ctaLink).toHaveAttribute("rel", expect.stringContaining("noopener"));
    // Regression: the booking link shipped as a "#" placeholder once.
    expect(ctaLink!.getAttribute("href")).not.toBe("#");
    expect(ctaLink!.getAttribute("href")).toMatch(/^https:\/\//);
  });

  // BOOK-02: the booking card is the highlighted (primary-tinted) option and the
  // form submit is a primary magnetic button.
  it("BOOK-02: booking card is highlighted and the submit button is a primary CTA", () => {
    const allBookingLinks = screen.getAllByRole("link", { name: /book a free 30-minute call/i });
    const ctaLink = allBookingLinks.find(
      (link) => link.getAttribute("target") === "_blank" && link.className.includes("border-primary"),
    );
    expect(ctaLink).toBeDefined();

    const submitButton = screen.getByRole("button", { name: /send message/i });
    expect(submitButton.className).toContain("bg-primary");
  });
});
