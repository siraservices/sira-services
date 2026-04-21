"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section>
      <div className="relative py-24 md:pb-32 lg:pb-36 lg:pt-44">
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-6 lg:block lg:px-12">
          <div className="mx-auto max-w-lg text-center lg:ml-0 lg:max-w-full lg:text-left">
            <h1 className="mt-8 max-w-2xl text-balance font-display font-bold text-5xl md:text-6xl lg:mt-16 xl:text-7xl text-text leading-tight">
              Build AI Systems That{" "}
              <span className="text-gradient">Drive Real Results</span>
            </h1>
            <p className="mt-8 max-w-2xl text-balance text-lg text-text-body font-body leading-relaxed">
              We help growth-stage companies and enterprises turn their data into
              competitive advantage — with AI strategy, reliable pipelines, and
              custom computer vision solutions.
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Button
                asChild
                size="lg"
                className={cn(
                  "h-12 rounded-full pl-6 pr-4 text-base font-display font-semibold",
                  "bg-cta text-cta-text hover:bg-cta/90 hover:shadow-cta-glow transition-all duration-200"
                )}
              >
                <Link href="/contact">
                  <span className="text-nowrap">Book a Consultation</span>
                  <ChevronRight className="ml-1 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="h-12 rounded-full px-6 text-base font-display text-text-muted hover:text-text hover:bg-surface-hover transition-colors duration-200"
              >
                <Link href="/services">
                  <span className="text-nowrap">View Our Services</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Video background */}
        <div className="absolute inset-1 overflow-hidden rounded-3xl border border-text-muted/10 aspect-[2/3] sm:aspect-video lg:rounded-[3rem]">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="size-full object-cover opacity-20 lg:opacity-30"
            src="https://ik.imagekit.io/lrigu76hy/tailark/dna-video.mp4?updatedAt=1745736251477"
          />
        </div>
      </div>
    </section>
  );
}
