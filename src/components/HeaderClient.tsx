"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

interface User {
  email: string;
}

interface HeaderClientProps {
  user: User | null;
  signInUrl: string;
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function HeaderClient({ user, signInUrl }: HeaderClientProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">
            SIRA<span className="text-blue-600">.services</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/admin"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Admin
                </Link>
                <span className="text-sm text-gray-600">{user.email}</span>
                <a
                  href="/sign-out"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Sign out
                </a>
              </>
            ) : (
              <a
                href={signInUrl}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Sign in
              </a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-100 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block py-2 text-sm font-medium ${
                  pathname === link.href
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t border-gray-100">
              {user ? (
                <>
                  <Link
                    href="/admin"
                    className="block py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                  <span className="block py-2 text-sm text-gray-500">
                    {user.email}
                  </span>
                  <a
                    href="/sign-out"
                    className="block py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    Sign out
                  </a>
                </>
              ) : (
                <a
                  href={signInUrl}
                  className="block py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Sign in
                </a>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
