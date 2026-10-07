import type { Metadata } from "next";
import {
  Plus_Jakarta_Sans,
  Cormorant_Garamond,
  Inter,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AuthKitProvider } from "@workos-inc/authkit-nextjs/components";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SITE_URL, DEFAULT_OG_IMAGE, organizationJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { SiteBackdrop } from "@/components/SiteBackdrop";
import { AUTH_ENABLED } from "@/lib/auth-config";

/* Type roles: display = Plus Jakarta Sans (headings, numbers, brand);
   serif italic = Cormorant Garamond (second hero line, flourishes);
   body = Inter; mono = JetBrains Mono (eyebrows, labels, status). */
const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SIRA | Computer Vision & ML Engineering",
    template: "%s | SIRA",
  },
  description:
    "Custom machine learning, AI, and computer vision solutions for businesses. Transform your data into actionable intelligence.",
  keywords: [
    "machine learning",
    "AI",
    "computer vision",
    "ML consulting",
    "AI development",
  ],
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.svg" },
  openGraph: {
    siteName: "SIRA",
    type: "website",
    locale: "en_US",
    url: "/",
    title: "SIRA | AI & ML Engineering",
    description:
      "Custom machine learning, AI, and computer vision solutions for businesses.",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "SIRA | AI & ML Engineering",
    description:
      "Custom machine learning, AI, and computer vision solutions for businesses.",
    images: [DEFAULT_OG_IMAGE.url],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  const shell = (
    <ConvexClientProvider authEnabled={AUTH_ENABLED}>
      <div className="min-h-screen flex flex-col">
        <Navigation authEnabled={AUTH_ENABLED} />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </ConvexClientProvider>
  );

  return (
    <html
      lang="en"
      className={`${display.variable} ${serif.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="font-body antialiased bg-background text-text-body">
        <JsonLd data={organizationJsonLd()} />
        <div className="noise-overlay" aria-hidden="true" />
        <SiteBackdrop />
        {AUTH_ENABLED ? <AuthKitProvider>{shell}</AuthKitProvider> : shell}
      </body>
      {gaMeasurementId && <GoogleAnalytics gaId={gaMeasurementId} />}
    </html>
  );
}
