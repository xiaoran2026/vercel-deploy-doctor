"use client";

import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { PLANS } from "@/lib/planConfig";

export default function PricingPage() {
  return (
    <div className="min-h-screen py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Pre-launch pricing · All paid tiers 37% OFF · Locked in forever
          </div>
          <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight">
            Simple, honest pricing
          </h1>
          <p className="mt-4 text-base text-gray-600 leading-relaxed">
            Start free forever. Upgrade when you want scheduled checks, CI integration, and AI fix recipes.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((p, idx) => {
            const earlyBird: Record<string, { display: string; original: string } | null> = {
              FREE: null,
              STARTER: { display: "$12", original: "$19" },
              GROWTH:  { display: "$32", original: "$49" },
              AGENCY:  { display: "$99", original: "$149" },
            };
            const eb = earlyBird[p.id];
            const badge = p.badge ?? (eb ? "Early Bird · -37%" : null);
            const highlight = p.popular;
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
                      <p className={`text-sm mb-1 font-medium ${highlight ? "text-white/60" : "text-gray-500"}`}>{p.price ? "/mo" : ""}</p>
                    </>
                  ) : (
                    <p className={`text-4xl font-bold tracking-tight ${highlight ? "text-white" : "text-gray-950"}`}>
                      ${p.price}{p.price ? <span className="text-sm font-medium"> /mo</span> : ""}
                    </p>
                  )}
                </div>

                <Link
                  href="/register"
                  className={`mt-5 inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl text-sm font-semibold transition-colors ${
                    highlight
                      ? "bg-white text-gray-950 hover:bg-gray-100"
                      : "bg-gray-950 text-white hover:bg-gray-800"
                  }`}
                >
                  {idx === PLANS.length - 1 ? "Talk to us" : "Get started"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <div className={`mt-6 space-y-2.5 text-sm flex-1 ${highlight ? "text-white/80" : "text-gray-700"}`}>
                  {p.features.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${highlight ? "text-emerald-400" : "text-emerald-600"}`} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-xs text-center text-gray-500">
            All prices in USD. Early-bird discount locks in when you create an account during pre-launch.
            Cancel anytime. Questions? Email <a className="text-gray-700 underline" href="mailto:founders@deploydoctor.dev">founders@deploydoctor.dev</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
