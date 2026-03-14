"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Mail, MessageSquare, CheckCircle } from "lucide-react";
import { LiquidButton } from "@/components/ui/liquid-glass-button";

export default function ContactPage() {
  const submitLead = useMutation(api.leads.submit);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitLead({
        name: formData.name,
        email: formData.email,
        company: formData.company || undefined,
        message: formData.message,
        source: "contact-page",
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="pt-32 pb-20 px-6 bg-white dark:bg-gray-900 min-h-screen">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-[#FFFDF5] dark:bg-gray-800 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-[#000000] dark:text-amber-500" />
          </div>
          <h1 className="text-3xl font-display font-bold text-[#1A1A1A] dark:text-white mb-4">
            Thank You!
          </h1>
          <p className="text-[#666666] dark:text-gray-400 font-body leading-relaxed text-lg">
            Your message has been received. I&apos;ll get back to you within
            24-48 hours to discuss how we can work together.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 bg-white dark:bg-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <span className="text-xs font-display font-semibold uppercase tracking-[0.2em] text-[#333333] dark:text-gray-400 mb-3 block">
            Get In Touch
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-[#1A1A1A] dark:text-white mb-6">
            Let&apos;s work together
          </h1>
          <p className="text-lg text-[#666666] dark:text-gray-400 font-body leading-relaxed">
            Have a project in mind? I&apos;d love to hear about it. Fill out the
            form below and I&apos;ll get back to you within 24-48 hours.
          </p>
        </div>

        <div className="grid md:grid-cols-[280px,1fr] gap-12">
          {/* Contact Info Sidebar */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-card border border-[#D4CFC4] dark:border-gray-700 transition-all duration-200">
              <div className="w-10 h-10 rounded-lg bg-[#FFFDF5] dark:bg-gray-700 flex items-center justify-center mb-4">
                <Mail className="h-5 w-5 text-[#000000] dark:text-amber-500" />
              </div>
              <h3 className="font-display font-medium text-[#1A1A1A] dark:text-white text-sm mb-1">
                Email
              </h3>
              <a
                href="mailto:hello@sira.services"
                className="text-sm text-[#666666] dark:text-gray-400 hover:text-[#333333] dark:hover:text-amber-500 transition-colors duration-200 cursor-pointer"
              >
                hello@sira.services
              </a>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-card border border-[#D4CFC4] dark:border-gray-700 transition-all duration-200">
              <div className="w-10 h-10 rounded-lg bg-[#FFFDF5] dark:bg-gray-700 flex items-center justify-center mb-4">
                <MessageSquare className="h-5 w-5 text-[#000000] dark:text-amber-500" />
              </div>
              <h3 className="font-display font-medium text-[#1A1A1A] dark:text-white text-sm mb-1">
                Response Time
              </h3>
              <p className="text-sm text-[#666666] dark:text-gray-400 font-body">
                Within 24-48 hours
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <form
            onSubmit={handleSubmit}
            className="p-8 md:p-10 rounded-2xl bg-white dark:bg-gray-800 shadow-card border border-[#D4CFC4] dark:border-gray-700 space-y-6"
          >
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-display font-medium text-[#1A1A1A] dark:text-gray-300 mb-2"
                >
                  Name <span className="text-[#FFD700]">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#FFF8E7] dark:bg-gray-700 border border-[#D4CFC4] dark:border-gray-600 rounded-lg text-[#1A1A1A] dark:text-white font-body placeholder-[#999999] dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#000000]/30 dark:focus:ring-amber-500 focus:border-[#333333] dark:focus:border-transparent transition-all duration-200"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-display font-medium text-[#1A1A1A] dark:text-gray-300 mb-2"
                >
                  Email <span className="text-[#FFD700]">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#FFF8E7] dark:bg-gray-700 border border-[#D4CFC4] dark:border-gray-600 rounded-lg text-[#1A1A1A] dark:text-white font-body placeholder-[#999999] dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#000000]/30 dark:focus:ring-amber-500 focus:border-[#333333] dark:focus:border-transparent transition-all duration-200"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="company"
                className="block text-sm font-display font-medium text-[#1A1A1A] dark:text-gray-300 mb-2"
              >
                Company{" "}
                <span className="text-[#999999] font-normal">(optional)</span>
              </label>
              <input
                type="text"
                id="company"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#FFF8E7] dark:bg-gray-700 border border-[#D4CFC4] dark:border-gray-600 rounded-lg text-[#1A1A1A] dark:text-white font-body placeholder-[#999999] dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#000000]/30 dark:focus:ring-amber-500 focus:border-[#333333] dark:focus:border-transparent transition-all duration-200"
                placeholder="Your company name"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-display font-medium text-[#1A1A1A] dark:text-gray-300 mb-2"
              >
                Tell me about your project{" "}
                <span className="text-[#FFD700]">*</span>
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="What problem are you trying to solve? What does success look like?"
                className="w-full px-4 py-3 bg-[#FFF8E7] dark:bg-gray-700 border border-[#D4CFC4] dark:border-gray-600 rounded-lg text-[#1A1A1A] dark:text-white font-body placeholder-[#999999] dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#000000]/30 dark:focus:ring-amber-500 focus:border-[#333333] dark:focus:border-transparent transition-all duration-200 resize-none"
              />
            </div>

            <LiquidButton
              type="submit"
              disabled={loading}
              size="xl"
              className="w-full font-display font-semibold text-base text-[#1A1A1A]"
            >
              {loading ? "Sending..." : "Send Message"}
            </LiquidButton>
          </form>
        </div>
      </div>
    </div>
  );
}
