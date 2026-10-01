"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { BOOKING_URL } from "@/lib/seo";

const navLinks = [
  { href: "/services", label: "Services" },
  { href: "/case-studies", label: "Case studies" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const isActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

/**
 * Signed-in user chip + sign-out. Only rendered when AuthKit is configured,
 * because useAuth() requires the AuthKitProvider.
 */
function NavUserMenu({
  variant,
  onDone,
}: {
  variant: "desktop" | "mobile";
  onDone?: () => void;
}) {
  const { user, loading, signOut } = useAuth();
  if (loading || !user) return null;

  if (variant === "desktop") {
    return (
      <div className="ml-4 pl-4 border-l border-text-muted/20">
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-muted flex items-center gap-2">
            <User className="h-3.5 w-3.5" />
            {user.firstName || user.email}
          </span>
          <button
            onClick={() => signOut()}
            aria-label="Sign out"
            className="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text transition-colors duration-200 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-text-muted/20">
      <span className="block px-4 py-2 text-sm text-text-muted flex items-center gap-2">
        <User className="h-3.5 w-3.5" />
        {user.firstName || user.email}
      </span>
      <button
        onClick={() => {
          signOut();
          onDone?.();
        }}
        className="block w-full text-left px-4 py-2.5 text-sm font-medium text-text-muted hover:text-text flex items-center gap-2 cursor-pointer"
      >
        <LogOut className="h-3.5 w-3.5" />
        Sign Out
      </button>
    </div>
  );
}

export function Navigation({ authEnabled = true }: { authEnabled?: boolean }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      // Glass deepens once content scrolls under the bar. Only colour and
      // shadow transition; the blur itself is never animated.
      className={`fixed top-4 left-4 right-4 z-50 rounded-2xl transition-[background-color,box-shadow] duration-300 ${
        mobileMenuOpen
          ? "glass-strong bg-paper/[0.94]"
          : scrolled
            ? "glass-strong"
            : "glass"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2 cursor-pointer">
            <Image
              src="/sira-mark.png"
              alt="SIRA mark"
              width={28}
              height={28}
              className="w-7 h-7"
            />
            <span className="text-xl font-display font-extrabold tracking-tight text-text">
              SIRA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-full cursor-pointer ${
                  isActive(pathname, link.href)
                    ? "text-text bg-primary/10"
                    : "text-text-muted hover:text-text hover:bg-surface-hover"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 inline-flex h-9 items-center rounded-full bg-cta px-4 font-display text-sm font-semibold text-cta-text transition-colors duration-200 hover:bg-charcoal"
            >
              Book a call
            </a>

            {authEnabled && <NavUserMenu variant="desktop" />}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-text-muted hover:text-text transition-colors duration-200 cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 pt-4 border-t border-text-muted/20 animate-fade-in">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-2.5 text-sm font-medium rounded-full transition-colors duration-200 cursor-pointer ${
                    isActive(pathname, link.href)
                      ? "text-text bg-primary/10"
                      : "text-text-muted hover:text-text hover:bg-surface-hover"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-4 flex h-11 items-center justify-center rounded-full bg-cta font-display text-sm font-semibold text-cta-text"
            >
              Book a free call
            </a>

            {authEnabled && (
              <NavUserMenu variant="mobile" onDone={() => setMobileMenuOpen(false)} />
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
