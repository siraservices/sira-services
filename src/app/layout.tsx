import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ConvexClientProvider>
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </ConvexClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
