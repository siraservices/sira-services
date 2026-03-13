/**
 * Tests for Navigation component auth behavior
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Navigation } from "@/components/Navigation";

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

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

// Mock lucide-react
jest.mock("lucide-react", () => ({
  Menu: () => <span data-testid="menu-icon">Menu</span>,
  X: () => <span data-testid="x-icon">X</span>,
  LogOut: () => <span data-testid="logout-icon">LogOut</span>,
  User: () => <span data-testid="user-icon">User</span>,
}));

// Mock useAuth from WorkOS
const mockSignOut = jest.fn();
const mockUseAuth = jest.fn();
jest.mock("@workos-inc/authkit-nextjs/components", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("Navigation - Auth States", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignOut.mockResolvedValue(undefined);
  });

  it("does not show Sign In link when user is not authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signOut: mockSignOut,
    });

    render(<Navigation />);

    expect(screen.queryByText("Sign In")).not.toBeInTheDocument();
  });

  it("shows nothing while auth is loading", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      signOut: mockSignOut,
    });

    render(<Navigation />);

    expect(screen.queryByText("Sign In")).not.toBeInTheDocument();
  });

  it("shows user name when authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: {
        firstName: "John",
        email: "john@example.com",
      },
      loading: false,
      signOut: mockSignOut,
    });

    render(<Navigation />);

    expect(screen.getAllByText("John").length).toBeGreaterThan(0);
    expect(screen.queryByText("Sign In")).not.toBeInTheDocument();
  });

  it("shows email when firstName is not available", () => {
    mockUseAuth.mockReturnValue({
      user: {
        firstName: null,
        email: "john@example.com",
      },
      loading: false,
      signOut: mockSignOut,
    });

    render(<Navigation />);

    expect(screen.getAllByText("john@example.com").length).toBeGreaterThan(0);
  });

  it("calls signOut when sign out button is clicked", async () => {
    mockUseAuth.mockReturnValue({
      user: {
        firstName: "John",
        email: "john@example.com",
      },
      loading: false,
      signOut: mockSignOut,
    });

    const user = userEvent.setup();
    render(<Navigation />);

    // Find the desktop sign out button (has LogOut icon)
    const signOutButtons = screen.getAllByTestId("logout-icon");
    expect(signOutButtons.length).toBeGreaterThan(0);

    // Click the first sign out button (desktop)
    const desktopButton = signOutButtons[0].closest("button");
    if (desktopButton) {
      await user.click(desktopButton);
    }

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  it("renders all navigation links", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signOut: mockSignOut,
    });

    render(<Navigation />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Blog")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
    expect(screen.queryByText("Services")).not.toBeInTheDocument();
    expect(screen.queryByText("About")).not.toBeInTheDocument();
  });
});
