"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const highlights = [
  {
    title: "40+ checks",
    desc: "HTTP response, security headers, caching, performance, SEO, a11y in one pass",
  },
  {
    title: "Fix recipes",
    desc: "Copy-paste code snippets for every finding — vercel.json, headers, and SEO meta",
  },
  {
    title: "Under 30s",
    desc: "Sign up, paste a Vercel URL, and walk away with a 5-dimension scorecard",
  },
];

const proofPoints = [
  "One free deploy health scan included with every account",
  "Paid plans unlock weekly regression monitoring on your prod domains",
  "Early-bird Solo pricing locked forever — price rises after 100 seats",
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authApi.login({ email, password });
      if (res.data.code === 200) {
        const { token, userId, email: userEmail, plan, role } = res.data.data;
        const user = { id: userId, email: userEmail, plan, role };
        login(token, user);
        router.push(role === "ADMIN" ? "/dashboard" : "/dashboard");
      } else {
        setError(res.data.message || "Login failed.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-indigo-50/40 px-4 py-10 sm:px-6">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
        {/* ===== LEFT — Brand & Benefits ===== */}
        <section className="relative overflow-hidden rounded-[32px] border border-white bg-white p-8 shadow-[0_1px_0_rgba(15,23,42,0.04),0_20px_60px_-30px_rgba(99,102,241,0.25)] sm:p-12">
          <div className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-300/30 via-violet-200/30 to-emerald-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-200/40 to-indigo-200/30 blur-3xl" />

          <div className="relative flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-emerald-500 text-white shadow-sm">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-[15px] font-bold tracking-tight text-gray-900">Deploy Doctor</span>
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Early-bird · 12 seats left
            </span>
          </div>

          <div className="relative mt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
              Pre-launch access
            </p>
            <h1 className="mt-4 max-w-xl text-[40px] font-bold leading-[1.05] tracking-[-0.02em] text-gray-950 sm:text-5xl">
              Ship Vercel deploys that
              <span className="block bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-600 bg-clip-text text-transparent">
                don&apos;t silently break.
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-gray-600">
              Sign in to run a deploy health audit on any Vercel URL, review your historical scorecards, and upgrade to the Solo plan when you&apos;re ready for monitoring.
            </p>
          </div>

          <div className="relative mt-10 grid gap-4 sm:grid-cols-3">
            {highlights.map((h) => (
              <div
                key={h.title}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50/60 p-5 transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_12px_40px_-20px_rgba(99,102,241,0.35)]"
              >
                <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-xl font-bold tracking-tight text-gray-950">{h.title}</p>
                <p className="mt-1.5 text-[13px] leading-6 text-gray-600">{h.desc}</p>
              </div>
            ))}
          </div>

          <div className="relative mt-10 space-y-3 rounded-2xl border border-indigo-50 bg-indigo-50/30 p-5">
            {proofPoints.map((item) => (
              <div key={item} className="flex items-start gap-3 text-[14px] text-gray-700">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="relative mt-10 flex flex-wrap items-center gap-3 text-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
            >
              Back to landing
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <span className="text-gray-300">·</span>
            <Link href="/pricing" className="font-semibold text-gray-700 transition-colors hover:text-gray-950">
              See pricing
            </Link>
            <span className="text-gray-300">·</span>
            <Link href="/privacy" className="font-semibold text-gray-700 transition-colors hover:text-gray-950">
              Privacy
            </Link>
          </div>
        </section>

        {/* ===== RIGHT — Sign in form ===== */}
        <section className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm sm:p-10">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-gray-950 px-2.5 py-1 text-[11px] font-semibold text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Early access · v0.1
          </div>
          <h2 className="text-[28px] font-bold tracking-tight text-gray-950">Sign in</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Access your dashboard, re-run scans, and review historical deploy health reports.
          </p>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-[14px] text-gray-950 transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-[14px] text-gray-950 transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Remember me for 30 days</span>
              </label>
              <Link
                href="/privacy"
                className="text-sm font-medium text-gray-500 transition-colors hover:text-indigo-600"
              >
                Need help?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-gray-950 to-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-gray-950/10 transition-all hover:shadow-xl hover:shadow-indigo-600/15 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing you in…
                </>
              ) : (
                <>
                  Sign in to Deploy Doctor
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              New to Deploy Doctor
            </span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-white p-5">
            <p className="text-sm font-semibold text-gray-950">First time here?</p>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Create a free account to run one full deploy audit and share the report with your team.
            </p>
            <Link
              href="/register"
              className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 transition-all hover:border-indigo-300 hover:bg-indigo-50"
            >
              Create a free account
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
