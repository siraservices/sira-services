"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header
      className={`fixed top-4 left-4 right-4 z-50 transition-all duration-300 rounded-2xl ${
        scrolled
          ? "bg-paper/90 backdrop-blur-md shadow-elevated border border-text-muted/20"
          : "bg-paper/60 backdrop-blur-sm"
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
                  pathname === link.href
                    ? "text-text bg-primary/10"
                    : "text-text-muted hover:text-text hover:bg-surface-hover"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="ml-4 pl-4 border-l border-text-muted/20">
              {!loading && user && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-text-muted flex items-center gap-2">
                    <User className="h-3.5 w-3.5" />
                    {user.firstName || user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text transition-colors duration-200 cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
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
                    pathname === link.href
                      ? "text-text bg-primary/10"
                      : "text-text-muted hover:text-text hover:bg-surface-hover"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {!loading && user && (
              <div className="mt-4 pt-4 border-t border-text-muted/20">
                <span className="block px-4 py-2 text-sm text-text-muted flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />
                  {user.firstName || user.email}
                </span>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2.5 text-sm font-medium text-text-muted hover:text-text flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
