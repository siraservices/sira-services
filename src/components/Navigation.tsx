"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, User, ArrowUpRight } from "lucide-react";
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
    const handleScroll = () => setScrolled(window.scrollY > 80);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Over the homepage hero (dark) the pill is dark glass with white text;
  // everywhere else, and once scrolled, it is light glass with ink text.
  const dark = pathname === "/" && !scrolled && !mobileMenuOpen;
  const linkBase = dark
    ? "text-white/75 hover:text-white hover:bg-white/10"
    : "text-text-muted hover:text-text hover:bg-surface-hover";
  const linkActive = dark ? "text-white bg-white/15" : "text-primary-dark bg-primary/10";

  return (
    <header
      // A centred pill. Glass deepens once content scrolls under it; only
      // colour and shadow transition, the blur itself is never animated.
      className={`fixed top-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 transition-[background-color,box-shadow,color] duration-300 ${
        mobileMenuOpen
          ? "glass-strong rounded-3xl bg-paper/[0.96]"
          : dark
            ? "glass-dark rounded-full border border-white/10"
            : scrolled
              ? "glass-strong rounded-full"
              : "glass rounded-full"
      }`}
    >
      <nav className="px-4 py-2.5 sm:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2.5 cursor-pointer">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary ring-2 ring-primary/30 transition group-hover:ring-primary/60">
              <Image
                src="/sira-mark-white.svg"
                alt="SIRA mark"
                width={20}
                height={20}
                className="h-5 w-5"
              />
            </span>
            <span className={`text-xl font-display font-extrabold tracking-tight ${dark ? "text-white" : "text-text"}`}>
              SIRA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`lift-on-hover relative px-3.5 py-2 text-sm font-medium transition-colors duration-200 rounded-full cursor-pointer ${
                  isActive(pathname, link.href) ? linkActive : linkBase
                }`}
              >
                {link.label}
              </Link>
            ))}

            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="magnetic-btn ml-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 font-display text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-colors duration-200 hover:bg-primary-dark"
            >
              Book a call
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>

            {authEnabled && <NavUserMenu variant="desktop" />}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden p-2 transition-colors duration-200 cursor-pointer ${dark ? "text-white/80 hover:text-white" : "text-text-muted hover:text-text"}`}
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
                      ? "text-primary-dark bg-primary/10"
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
              className="magnetic-btn mt-4 flex h-11 items-center justify-center rounded-full bg-primary font-display text-sm font-semibold text-white shadow-lg shadow-primary/30"
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
