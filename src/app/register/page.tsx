"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const perks = [
  {
    title: "Free forever",
    desc: "One deploy health scan per account — no credit card, no time limit",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Early-bird",
    desc: "First 100 Solo seats locked at $19 for life — no retroactive price hikes",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Influence roadmap",
    desc: "Founders Club members get one rule voted in + report templates they ask for",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
];

const included = [
  "One free deploy health report on any Vercel or custom domain",
  "Full 5-dimension scorecard + copy-paste fix recipes",
  "Shareable report link — send it to your team without another login",
  "Upgrade to Solo ($19) when you want weekly monitoring",
];

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.register({ name: name || undefined, email, password });
      if (res.data.code === 200 || res.data.code === 201) {
        const loginRes = await authApi.login({ email, password });
        if (loginRes.data.code === 200) {
          const { token, userId, email: userEmail, plan, role } = loginRes.data.data;
          const user = { id: userId, email: userEmail, plan, role };
          login(token, user);
          router.push("/dashboard");
        } else {
          router.push("/login");
        }
      } else {
        setError(res.data.message || "Registration failed.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-emerald-50/40 px-4 py-10 sm:px-6">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
        {/* ===== LEFT — Brand & Benefits ===== */}
        <section className="relative overflow-hidden rounded-[32px] border border-white bg-white p-8 shadow-[0_1px_0_rgba(15,23,42,0.04),0_20px_60px_-30px_rgba(16,185,129,0.25)] sm:p-12">
          <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-gradient-to-br from-emerald-300/30 via-teal-200/30 to-indigo-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-gradient-to-br from-indigo-200/40 to-violet-200/30 blur-3xl" />

          <div className="relative flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-indigo-600 text-white shadow-sm">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-[15px] font-bold tracking-tight text-gray-900">Deploy Doctor</span>
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              1 scan · signup to claim
            </span>
          </div>

          <div className="relative mt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Pre-launch · Founders Club
            </p>
            <h1 className="mt-4 max-w-xl text-[40px] font-bold leading-[1.05] tracking-[-0.02em] text-gray-950 sm:text-5xl">
              Catch broken deploys
              <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">
                before your users tweet about them.
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-gray-600">
              Create an account, paste a Vercel URL, and get a full deploy health audit in under 30 seconds — security headers, caching, SEO meta, a11y, and regressions.
            </p>
          </div>

          <div className="relative mt-10 grid gap-4 sm:grid-cols-3">
            {perks.map((p) => (
              <div
                key={p.title}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50/60 p-5 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_12px_40px_-20px_rgba(16,185,129,0.35)]"
              >
                <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100">
                  {p.icon}
                </div>
                <p className="text-xl font-bold tracking-tight text-gray-950">{p.title}</p>
                <p className="mt-1.5 text-[13px] leading-6 text-gray-600">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="relative mt-10 space-y-3 rounded-2xl border border-emerald-50 bg-emerald-50/40 p-5">
            {included.map((item) => (
              <div key={item} className="flex items-start gap-3 text-[14px] text-gray-700">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="relative mt-10 flex flex-wrap items-center gap-3 text-sm">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 transition-colors hover:text-emerald-800"
            >
              Compare plans
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <span className="text-gray-300">·</span>
            <Link href="/" className="font-semibold text-gray-700 transition-colors hover:text-gray-950">
              Back to landing
            </Link>
            <span className="text-gray-300">·</span>
            <Link href="/privacy" className="font-semibold text-gray-700 transition-colors hover:text-gray-950">
              Data privacy
            </Link>
          </div>
        </section>

        {/* ===== RIGHT — Create account form ===== */}
        <section className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm sm:p-10">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm shadow-emerald-500/20">
            <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Join 800+ Next.js devs · 12 of 100 Founders left
          </div>
          <h2 className="text-[28px] font-bold tracking-tight text-gray-950">Create your account</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Free forever for one audit — credit card only when you want weekly monitoring.
          </p>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
                Name <span className="text-gray-400">(optional)</span>
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-[14px] text-gray-950 transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                placeholder="Alex Engineer"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                Work email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-[14px] text-gray-950 transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-[14px] text-gray-950 transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-[14px] text-gray-950 transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                placeholder="Repeat password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/15 transition-all hover:shadow-xl hover:shadow-emerald-500/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating your account…
                </>
              ) : (
                <>
                  Claim my Founders scan
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>

            <p className="text-xs leading-6 text-gray-500">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="font-medium text-gray-900 hover:text-emerald-700">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-medium text-gray-900 hover:text-emerald-700">
                Privacy Policy
              </Link>
              . We only touch the URL you ask us to scan — no auth tokens, no source code access.
            </p>
          </form>

          <div className="mt-6 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-white p-5">
            <p className="text-sm font-semibold text-gray-950">30-day money-back</p>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Upgrade to Solo risk-free. If Deploy Doctor doesn&apos;t save you from at least one broken-deploy incident in 30 days, email us for a full refund — no questions asked.
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already in?{" "}
            <Link href="/login" className="font-medium text-gray-900 hover:text-emerald-700">
              Sign in instead
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
