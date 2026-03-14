import Link from "next/link";
import { Linkedin, Github, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-surface-alt dark:bg-gray-900 text-text dark:border-t dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <Link href="/" className="inline-flex items-center gap-1 cursor-pointer">
              <span className="text-xl font-display font-bold tracking-tight text-text dark:text-white">
                SIRA
              </span>
              <span className="text-xl font-display font-bold tracking-tight text-cta dark:text-amber-500">
                .services
              </span>
            </Link>
            <p className="mt-4 text-sm text-text-muted dark:text-gray-400 leading-relaxed max-w-xs">
              Machine learning, AI, and computer vision solutions for businesses
              ready to innovate.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-text dark:text-white text-sm uppercase tracking-wider mb-5">
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
                  className="block text-sm text-text-muted dark:text-gray-400 hover:text-text dark:hover:text-amber-500 transition-colors duration-200 cursor-pointer"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-text dark:text-white text-sm uppercase tracking-wider mb-5">
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
                  className="p-2.5 rounded-lg bg-surface dark:bg-gray-800 text-text-muted dark:text-gray-400 hover:text-text dark:hover:text-amber-500 hover:bg-surface transition-all duration-200 cursor-pointer"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-text-muted/20 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted dark:text-gray-500">
            &copy; {new Date().getFullYear()} SIRA Services. All rights reserved.
          </p>
          <p className="text-xs text-text-muted dark:text-gray-500">
            Built with precision.
          </p>
        </div>
      </div>
    </footer>
  );
}
