import Link from "next/link";
import Image from "next/image";
import { Linkedin, Github, Mail, ArrowUpRight } from "lucide-react";
import { BOOKING_URL, CONTACT_EMAIL, SOCIAL_LINKS } from "@/lib/seo";
import { services } from "@/lib/services";

const companyLinks = [
  { href: "/case-studies", label: "Case studies" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/sitemap", label: "Sitemap" },
];

export function Footer() {
  return (
    <footer className="relative bg-deep text-white">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-5 lg:gap-8">
          {/* Brand block */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 cursor-pointer">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary ring-2 ring-primary/30">
                <Image
                  src="/sira-mark-white.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5"
                />
              </span>
              <span className="font-display text-xl font-bold tracking-tight">SIRA</span>
            </Link>
            <p className="mt-5 max-w-xs font-serif text-2xl italic leading-snug text-white/80">
              Engineered for production, not just for the demo.
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">
              Computer vision, machine learning, AI automation, and the websites
              that put small businesses in front of their customers.
            </p>
            <div className="mt-6 flex items-center gap-2.5 text-sm text-white/70">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              Booking new projects
            </div>
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="magnetic-btn mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-display text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary-dark"
            >
              Book a free call
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          {/* Services */}
          <div>
            <h4 className="eyebrow text-white/50">Services</h4>
            <ul className="mt-5 space-y-3">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="lift-on-hover inline-block text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="eyebrow text-white/50">Company</h4>
            <ul className="mt-5 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="lift-on-hover inline-block text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="eyebrow text-white/50">Contact</h4>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="lift-on-hover inline-block transition-colors hover:text-white"
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>Charlotte, NC · remote worldwide</li>
              <li>English / Español</li>
            </ul>
            <div className="mt-6 flex gap-2.5">
              {[
                { href: SOCIAL_LINKS.linkedin, icon: Linkedin, label: "LinkedIn" },
                { href: SOCIAL_LINKS.github, icon: Github, label: "GitHub" },
                { href: `mailto:${CONTACT_EMAIL}`, icon: Mail, label: "Email" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith("mailto") ? undefined : "_blank"}
                  rel={social.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                  className="lift-on-hover flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:border-primary/60 hover:text-white"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" strokeWidth={2.2} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/45">
            &copy; {new Date().getFullYear()} Aira Development LLC (SIRA). All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-white/45">
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
