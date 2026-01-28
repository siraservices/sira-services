import Link from "next/link";
import { Linkedin, Github, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-surface border-t border-[#333]">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="text-xl font-bold text-gray-100">
              SIRA<span className="text-primary">.services</span>
            </Link>
            <p className="mt-2 text-sm text-gray-400">
              Machine learning, AI, and computer vision solutions for businesses
              ready to innovate.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-100 mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link
                href="/services"
                className="block text-sm text-gray-400 hover:text-primary"
              >
                Services
              </Link>
              <Link
                href="/blog"
                className="block text-sm text-gray-400 hover:text-primary"
              >
                Blog
              </Link>
              <Link
                href="/contact"
                className="block text-sm text-gray-400 hover:text-primary"
              >
                Contact
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-100 mb-4">Connect</h4>
            <div className="flex gap-4">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="mailto:hello@sira.services"
                className="text-gray-400 hover:text-primary"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[#333] text-center text-sm text-gray-500">
          © {new Date().getFullYear()} SIRA Services. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
