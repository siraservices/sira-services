import type { Metadata } from "next";
import { Poppins, Open_Sans } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AuthKitProvider } from "@workos-inc/authkit-nextjs/components";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-opensans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SIRA Services | Machine Learning & AI Solutions",
  description:
    "Custom machine learning, AI, and computer vision solutions for businesses. Transform your data into actionable intelligence.",
  keywords: [
    "machine learning",
    "AI",
    "computer vision",
    "ML consulting",
    "AI development",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${openSans.variable}`}>
      <body className="font-body antialiased bg-surface text-text-body">
        <AuthKitProvider>
          <ConvexClientProvider>
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </ConvexClientProvider>
        </AuthKitProvider>
      </body>
    </html>
  );
}
