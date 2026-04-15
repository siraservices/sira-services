"use client";

import { useState } from "react";
import Link from "next/link";
import { getSignInUrlAction } from "@/app/actions/auth";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSSO = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = await getSignInUrlAction({ loginHint: email });
      window.location.href = url;
    } catch (error) {
      console.error("Failed to get sign in URL:", error);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const url = await getSignInUrlAction({ provider: "GoogleOAuth" });
      window.location.href = url;
    } catch (error) {
      console.error("Failed to get sign in URL:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-semibold text-white text-center mb-8">
          Sign in
        </h1>

        <div className="bg-gray-900 rounded-lg p-8">
          <form onSubmit={handleSSO} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-surface-alt text-text font-medium rounded-lg hover:bg-surface-hover transition-colors disabled:opacity-50"
            >
              {loading ? "Loading..." : "Continue with SSO"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-900 text-gray-400">OR</span>
            </div>
          </div>

          <div className="relative">
            <span className="absolute -top-2 right-4 bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded">
              Last used
            </span>
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 bg-gray-800 border border-gray-700 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </div>

          <p className="mt-6 text-center text-gray-400 text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-amber-500 hover:text-amber-400">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
