"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Sparkles, Mail, Clock, Zap, Loader2 } from "lucide-react";
import { PLANS } from "@/lib/planConfig";
import axios from "axios";

export default function PricingPage() {
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("STARTER");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setSubmitting(true);
    try {
      await axios.post("/api/waitlist", {
        email: email.trim(),
        plan,
        source: "pricing",
      });
      setSubmitted(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToWaitlist = (planId: string) => {
    setPlan(planId);
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="min-h-screen py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Pre-launch · Paid plans opening soon · Join waitlist for 37% OFF forever
          </div>
          <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight">
            Simple, honest pricing
          </h1>
          <p className="mt-4 text-base text-gray-600 leading-relaxed">
            Start free forever. Paid plans are in private beta — join the waitlist
            and lock in early-bird pricing before we go live.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((p) => {
            const earlyBird: Record<string, { display: string; original: string } | null> = {
              FREE: null,
              STARTER: { display: "$12", original: "$19" },
              GROWTH:  { display: "$32", original: "$49" },
              AGENCY:  { display: "$99", original: "$149" },
            };
            const eb = earlyBird[p.id];
            const badge = p.badge ?? (eb ? "Early Bird · -37%" : null);
            const highlight = p.popular;
            const isFree = p.id === "FREE";

            return (
              <div
                key={p.id}
                className={`relative p-6 rounded-3xl border flex flex-col ${
                  highlight
                    ? "bg-gray-950 text-white border-gray-950 shadow-[0_20px_60px_-15px_rgba(79,70,229,0.45)] scale-[1.02]"
                    : "bg-white text-gray-950 border-gray-200"
                }`}
              >
                {badge && (
                  <span
                    className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                      highlight
                        ? "bg-amber-400 text-gray-950 shadow-[0_4px_12px_-4px_rgba(251,191,36,0.8)]"
                        : "bg-indigo-600 text-white shadow-[0_4px_12px_-4px_rgba(79,70,229,0.6)]"
                    }`}
                  >
                    {badge}
                  </span>
                )}
                <div>
                  <p className={`text-base font-bold ${highlight ? "text-white" : "text-gray-950"}`}>{p.name}</p>
                  <p className={`mt-1 text-xs ${highlight ? "text-white/60" : "text-gray-500"}`}>{p.description}</p>
                </div>
                <div className="mt-5 flex items-end gap-1.5">
                  {eb ? (
                    <>
                      <p className={`text-4xl font-bold tracking-tight ${highlight ? "text-white" : "text-gray-950"}`}>{eb.display}</p>
                      <p className={`text-sm mb-1 font-medium line-through ${highlight ? "text-white/40" : "text-gray-400"}`}>{eb.original}</p>
                      <p className={`text-sm mb-1 font-medium ${highlight ? "text-white/60" : "text-gray-500"}`}>/mo</p>
                    </>
                  ) : (
                    <p className={`text-4xl font-bold tracking-tight ${highlight ? "text-white" : "text-gray-950"}`}>
                      ${p.price}{p.price ? <span className="text-sm font-medium"> /mo</span> : ""}
                    </p>
                  )}
                </div>

                {/* CTA button */}
                {isFree ? (
                  <Link
                    href="/register"
                    className={`mt-5 inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl text-sm font-semibold transition-colors ${
                      highlight
                        ? "bg-white text-gray-950 hover:bg-gray-100"
                        : "bg-gray-950 text-white hover:bg-gray-800"
                    }`}
                  >
                    Start free
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <button
                    onClick={() => scrollToWaitlist(p.id)}
                    className={`mt-5 inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl text-sm font-semibold transition-colors ${
                      highlight
                        ? "bg-white text-gray-950 hover:bg-gray-100"
                        : "bg-gray-950 text-white hover:bg-gray-800"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Join waitlist
                  </button>
                )}

                <div className={`mt-6 space-y-2.5 text-sm flex-1 ${highlight ? "text-white/80" : "text-gray-700"}`}>
                  {p.features.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${highlight ? "text-emerald-400" : "text-emerald-600"}`} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                {/* Paid plan badge: "Coming soon" */}
                {!isFree && (
                  <div className={`mt-4 pt-4 border-t ${highlight ? "border-white/10" : "border-gray-100"}`}>
                    <p className={`text-[11px] font-medium ${highlight ? "text-white/50" : "text-gray-400"}`}>
                      🔒 Paid plans open in ~10 days. Join the waitlist to lock in early-bird pricing.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Waitlist form */}
        <div id="waitlist" className="mt-14 scroll-mt-8">
          <div className="max-w-2xl mx-auto rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60 p-6 sm:p-10 shadow-sm">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-indigo-200 text-indigo-700 text-[11px] font-semibold">
                <Zap className="w-3.5 h-3.5" />
                Early Bird Waitlist
              </div>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-950">
                Lock in 37% off — forever
              </h2>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Paid plans open in ~10 days. Drop your email and pick a plan —
                we&apos;ll notify you the moment checkout goes live.
                First 50 sign-ups get the early-bird price locked for life.
              </p>
            </div>

            {submitted ? (
              <div className="mt-8 rounded-2xl bg-white border border-emerald-200 p-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-950">
                  You&apos;re on the list! 🎉
                </h3>
                <p className="mt-1.5 text-sm text-gray-600">
                  We saved your spot. The 37% early-bird discount is locked in for you.
                  We&apos;ll email you the moment paid plans go live.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWaitlist} className="mt-6 space-y-4">
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1.5 w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label htmlFor="plan" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Interested plan
                  </label>
                  <select
                    id="plan"
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    className="mt-1.5 w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                  >
                    <option value="STARTER">Starter — $12/mo (early bird, was $19)</option>
                    <option value="GROWTH">Growth — $32/mo (early bird, was $49)</option>
                    <option value="AGENCY">Agency — $99/mo (early bird, was $149)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Join the waitlist
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-gray-500">
                  We&apos;ll only email you about launch &amp; product updates. No spam, ever.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-xs text-center text-gray-500">
            All prices in USD. Early-bird discount locks in when you create an account during pre-launch.
            Cancel anytime. Questions? Email{" "}
            <a className="text-gray-700 underline" href="mailto:wendyens0038@gmail.com">
              wendyens0038@gmail.com
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
