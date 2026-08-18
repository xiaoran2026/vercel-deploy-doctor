"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Globe,
  Loader2,
  Sparkles,
  AlertCircle,
} from "lucide-react";

// Avoid useSearchParams() prerender issue in Next 15 — read URL client-side after mount
function readUrlFromLocation(): string {
  if (typeof window === "undefined") return "";
  try {
    const s = new URL(window.location.href).searchParams.get("url");
    return s ?? "";
  } catch {
    return "";
  }
}

export default function CheckPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [targetUrl, setTargetUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "running" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkId, setCheckId] = useState<string | null>(null);

  const startScan = useCallback(async (url: string) => {
    if (!url.trim()) {
      setError("Please enter a deployed URL to scan.");
      return;
    }
    setError(null);
    setStatus("submitting");
    setProgress(5);
    setCurrentStep("Starting scan...");

    try {
      const res = await api.post<any>("/checks", {
        targetUrl: url.trim(),
        includePerformance: true,
        includeSecurity: true,
        includeLighthouse: true,
        includeConfig: true,
      });
      const payload = res.data?.data ?? res.data;
      const cid: string = payload.checkId;
      setCheckId(cid);

      // If the engine already completed synchronously (returns reportId immediately)
      if (payload.reportId) {
        setStatus("done");
        setProgress(100);
        setTimeout(() => router.push(`/reports/${payload.reportId}`), 400);
        return;
      }

      // Otherwise, poll for status
      setStatus("running");
      setProgress(payload.progress ?? 10);
      setCurrentStep(payload.currentStep ?? "Scanning...");

      const pollTimer = setInterval(async () => {
        try {
          const pollRes = await api.get<any>(`/checks/${cid}`);
          const pollPayload = pollRes.data?.data ?? pollRes.data;
          const s = pollPayload.status;
          setProgress(pollPayload.progress ?? progress);
          setCurrentStep(pollPayload.currentStep ?? currentStep);

          if (s === "COMPLETED" || s === "FAILED") {
            clearInterval(pollTimer);
            if (s === "COMPLETED") {
              setStatus("done");
              setProgress(100);
              const rid = pollPayload.reportId ?? cid;
              setTimeout(() => router.push(`/reports/${rid}`), 400);
            } else {
              setStatus("error");
              setError(pollPayload.errorMessage || "Scan failed. Please try again.");
            }
          }
        } catch {
          // ignore transient errors, next poll will retry
        }
      }, 2500);
    } catch (err: any) {
      setStatus("error");
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Could not start scan. Please check the URL and try again.";
      setError(msg);
    }
  }, [router, progress, currentStep]);

  // Auto-start if url param provided
  useEffect(() => {
    const urlFromQuery = readUrlFromLocation();
    if (urlFromQuery) {
      setTargetUrl(urlFromQuery);
      if (status === "idle") {
        startScan(urlFromQuery);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startScan(targetUrl);
  };

  const progressPct = Math.max(5, Math.min(100, progress || 0));

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-950">
      {/* Header */}
      <header className="border-b border-gray-200/70 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-950 to-gray-700 text-white flex items-center justify-center shadow-sm">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight leading-tight">Deploy Doctor</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.18em]">for Vercel</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            {!user ? (
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-gray-950 text-white hover:bg-gray-800 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Join Waitlist
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-gray-950 text-white hover:bg-gray-800 transition-colors"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <div className="mt-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white text-[11px] font-semibold text-gray-600">
            {user ? (
              <>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Signed in as {user.email}
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Guest scan · No signup needed
              </>
            )}
          </div>

          <h1 className="mt-5 text-3xl md:text-4xl font-bold tracking-tight">
            Scan any Vercel deploy for silent regressions
          </h1>
          <p className="mt-3 text-base text-gray-600 leading-relaxed">
            40+ checks across headers, caching, vercel.json, performance, SEO, a11y — with the
            exact code snippet to fix each finding.
          </p>
        </div>

        {/* URL Input (always editable so visitor can retry without going back) */}
        <form onSubmit={onSubmit} className="mt-8">
          <div
            className={`flex flex-col sm:flex-row gap-2.5 p-1.5 rounded-2xl border bg-white shadow-sm transition-colors ${
              status === "error"
                ? "border-red-300 ring-2 ring-red-100"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-center gap-2 flex-1 px-3">
              <Globe className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="my-next-app.vercel.app or your custom domain"
                disabled={status === "submitting" || status === "running"}
                className="flex-1 h-12 bg-transparent outline-none text-sm placeholder:text-gray-400 min-w-0 disabled:opacity-60"
              />
            </div>
            <button
              type="submit"
              disabled={status === "submitting" || status === "running"}
              className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-gray-950 text-white text-sm font-semibold hover:bg-gray-800 transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === "submitting" || status === "running" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  {status === "done" ? "View report" : "Run Scan"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Progress block */}
        {(status === "submitting" || status === "running" || status === "done") && (
          <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm overflow-hidden">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                  {status === "done" ? "Scan complete" : "Scan in progress"}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-lg font-semibold text-gray-950">
                    {currentStep ?? "Analyzing deploy..."}
                  </p>
                  {status === "done" && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  )}
                  {(status === "running" || status === "submitting") && (
                    <Loader2 className="w-4 h-4 text-indigo-500 animate-spin shrink-0" />
                  )}
                </div>
              </div>
              <p
                className={`text-3xl font-bold tabular-nums ${
                  status === "done" ? "text-emerald-600" : "text-gray-950"
                }`}
              >
                {progressPct}%
              </p>
            </div>

            <div className="mt-6 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ease-out ${
                  status === "done" ? "bg-emerald-500" : "bg-indigo-500"
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Status checklist */}
            <div className="mt-6 space-y-2 text-sm">
              {[
                { key: 10, label: "Probe target URL & validate response" },
                { key: 35, label: "Scan HTTP headers, meta tags & a11y baseline" },
                { key: 70, label: "Build report, score findings, save results" },
                { key: 100, label: "Ready — opening your report" },
              ].map((step, i) => {
                const reached = progressPct >= step.key;
                const lastDone = status === "done" && i === 3;
                return (
                  <div
                    key={step.key}
                    className={`flex items-center gap-3 transition-colors ${
                      reached ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {reached ? (
                      lastDone ? (
                        <Loader2 className="w-4 h-4 text-emerald-500 animate-spin shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      )
                    ) : (
                      <span className="w-4 h-4 rounded-full border-2 border-gray-200 shrink-0" />
                    )}
                    <span className="text-sm">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Error state */}
        {status === "error" && error && (
          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50/60 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">Scan couldn&apos;t complete</h3>
                <p className="mt-1 text-sm text-red-700 leading-relaxed">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Idle / error — reassurance strip */}
        {(status === "idle" || status === "error") && (
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-medium text-gray-500">
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> No signup required
            </span>
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> No Vercel token or install
            </span>
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Results in ~30 seconds
            </span>
          </div>
        )}

        {/* Conversion banner for guests */}
        {!user && (
          <div className="mt-12 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50/80 via-white to-violet-50/50 p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-950">
                  Lock in 37% off — forever · Save this scan
                </h3>
                <p className="mt-1.5 text-sm text-gray-600 leading-relaxed max-w-2xl">
                  Create a free account to keep your scan history, compare deploys over time, and
                  lock the early-bird pricing before public launch.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={checkId ? `/register?next=/reports/${checkId}` : "/register"}
                    className="inline-flex items-center px-4 py-2.5 rounded-xl bg-gray-950 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Sign Up Free · Early Bird
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    See pricing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
