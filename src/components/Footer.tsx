import Link from "next/link";
import { Linkedin, Github, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-surface-alt text-text">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <Link href="/" className="inline-flex items-center gap-1 cursor-pointer">
              <span className="text-xl font-display font-bold tracking-tight text-text">
                SIRA
              </span>
              <span className="text-xl font-display font-bold tracking-tight text-cta">
                .services
              </span>
            </Link>
            <p className="mt-4 text-sm text-text-muted leading-relaxed max-w-xs">
              Machine learning, AI, and computer vision solutions for businesses
              ready to innovate.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-text text-sm uppercase tracking-wider mb-5">
              Navigation
            </h4>
            <div className="space-y-3">
              {[
                { href: "/blog", label: "Blog" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-text-muted hover:text-text transition-colors duration-200 cursor-pointer"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-text text-sm uppercase tracking-wider mb-5">
              Connect
            </h4>
            <div className="flex gap-3">
              {[
                { href: "https://linkedin.com", icon: Linkedin, label: "LinkedIn" },
                { href: "https://github.com", icon: Github, label: "GitHub" },
                { href: "mailto:hello@sira.services", icon: Mail, label: "Email" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith("mailto") ? undefined : "_blank"}
                  rel={social.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                  className="p-2.5 rounded-lg bg-surface text-text-muted hover:text-text hover:bg-surface transition-all duration-200 cursor-pointer"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-text-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} SIRA Services. All rights reserved.
          </p>
          <p className="text-xs text-text-muted">
            Built with precision.
          </p>
        </div>
      </div>
    </footer>
  );
}
