import Link from "next/link";
import Image from "next/image";
import { Linkedin, Github, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-surface-alt text-text border-t border-surface-border">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 cursor-pointer">
              <Image
                src="/sira-mark.png"
                alt="SIRA mark"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <span className="text-xl font-display font-extrabold tracking-tight text-text">
                SIRA
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
                { href: "https://www.linkedin.com/company/siradev", icon: Linkedin, label: "LinkedIn" },
                { href: "https://github.com/siraservices", icon: Github, label: "GitHub" },
                { href: "mailto:aira4development@gmail.com", icon: Mail, label: "Email" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith("mailto") ? undefined : "_blank"}
                  rel={social.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                  className="p-2.5 rounded-full bg-surface text-text-muted hover:text-text hover:bg-surface-hover transition-all duration-200 cursor-pointer"
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
            &copy; 2026 Aira Development LLC (Sira). All rights reserved.
          </p>
          <p className="text-xs text-text-muted">
            AI &amp; ML Engineering
          </p>
        </div>
      </div>
    </footer>
  );
}
