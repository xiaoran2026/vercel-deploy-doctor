"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { DeployReport, Finding, Severity, FindingCategory } from "@/lib/types";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Gauge,
  Globe,
  Info,
  Loader2,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Search,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from "lucide-react";

function fmtDate(v?: string | null) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return v; }
}

function scoreColor(score: number | null | undefined) {
  if (score == null) return "text-gray-400";
  if (score >= 90) return "text-emerald-600";
  if (score >= 70) return "text-amber-600";
  if (score >= 50) return "text-orange-600";
  return "text-red-600";
}

function scoreBg(score: number) {
  if (score >= 90) return "from-emerald-500/15 to-emerald-500/5 border-emerald-200";
  if (score >= 70) return "from-amber-500/15 to-amber-500/5 border-amber-200";
  if (score >= 50) return "from-orange-500/15 to-orange-500/5 border-orange-200";
  return "from-red-500/15 to-red-500/5 border-red-200";
}

function scoreBar(score: number) {
  if (score >= 90) return "bg-emerald-500";
  if (score >= 70) return "bg-amber-500";
  if (score >= 50) return "bg-orange-500";
  return "bg-red-500";
}

function severityStyle(s: Severity) {
  switch (s) {
    case "CRITICAL": return {
      cls: "bg-red-50 text-red-700 border-red-200",
      ring: "ring-red-500/20",
      dot: "bg-red-500",
      label: "Critical",
      Icon: AlertCircle,
    };
    case "WARNING": return {
      cls: "bg-amber-50 text-amber-700 border-amber-200",
      ring: "ring-amber-500/20",
      dot: "bg-amber-500",
      label: "Warning",
      Icon: AlertTriangle,
    };
    case "INFO": return {
      cls: "bg-sky-50 text-sky-700 border-sky-200",
      ring: "ring-sky-500/20",
      dot: "bg-sky-500",
      label: "Info",
      Icon: Info,
    };
    case "PASS": return {
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
      ring: "ring-emerald-500/20",
      dot: "bg-emerald-500",
      label: "Passed",
      Icon: CheckCircle2,
    };
  }
}

function categoryStyle(c: FindingCategory) {
  switch (c) {
    case "DEPLOY":        return { label: "Deploy",       Icon: Globe,       cls: "text-violet-700 bg-violet-50 border-violet-200" };
    case "PERFORMANCE":   return { label: "Performance",  Icon: Gauge,       cls: "text-amber-700 bg-amber-50 border-amber-200" };
    case "ACCESSIBILITY": return { label: "Accessibility",Icon: Activity,    cls: "text-sky-700 bg-sky-50 border-sky-200" };
    case "SEO":           return { label: "SEO",          Icon: Search,      cls: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    case "SECURITY":      return { label: "Security",     Icon: ShieldCheck, cls: "text-red-700 bg-red-50 border-red-200" };
    case "CONFIG":        return { label: "Config",       Icon: BarChart3,   cls: "text-indigo-700 bg-indigo-50 border-indigo-200" };
  }
}

type CategoryFilter = FindingCategory | "ALL";
type SeverityFilter = Severity | "ALL";

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<DeployReport | null>(null);
  const [openFinding, setOpenFinding] = useState<string | null>(null);
  const [catFilter, setCatFilter] = useState<CategoryFilter>("ALL");
  const [sevFilter, setSevFilter] = useState<SeverityFilter>("ALL");
  const [showBanner, setShowBanner] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<any>(`/reports/${id}`);
      if (res.data?.code !== 200 || !res.data?.data) {
        throw new Error(res.data?.message || "Failed to load report");
      }
      setReport(res.data.data as unknown as DeployReport);
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-6 w-32 bg-gray-200 rounded" />
            <div className="h-40 bg-white border border-gray-200 rounded-2xl" />
            <div className="h-24 bg-white border border-gray-200 rounded-2xl" />
            <div className="h-96 bg-white border border-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
          </Link>
          <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-10 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-950">Report not found</h2>
            <p className="mt-1 text-sm text-gray-600">{error || "The report you're looking for doesn't exist."}</p>
            <Link href="/dashboard" className="mt-5 inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-gray-950 text-white text-sm font-medium">
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const findings = report.findings || [];
  const filtered = findings.filter((f) => {
    if (catFilter !== "ALL" && f.category !== catFilter) return false;
    if (sevFilter !== "ALL" && f.severity !== sevFilter) return false;
    return true;
  });

  const counts = {
    CRITICAL: findings.filter(f => f.severity === "CRITICAL").length,
    WARNING: findings.filter(f => f.severity === "WARNING").length,
    INFO: findings.filter(f => f.severity === "INFO").length,
    PASS: findings.filter(f => f.severity === "PASS").length,
  };

  const cats: FindingCategory[] = ["DEPLOY", "PERFORMANCE", "ACCESSIBILITY", "SEO", "SECURITY", "CONFIG"];
  const sevs: Severity[] = ["CRITICAL", "WARNING", "INFO", "PASS"];

  const scoreCards = [
    { label: "Deploy Health",  value: report.deployHealth,            Icon: Globe },
    { label: "Performance",    value: report.performanceScore ?? null,Icon: Gauge },
    { label: "Accessibility",  value: report.accessibilityScore ?? null, Icon: Activity },
    { label: "SEO",            value: report.seoScore ?? null,        Icon: Search },
    { label: "Security",       value: report.securityScore ?? null,   Icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <Link
          href={isAuthenticated ? "/dashboard" : "/"}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" /> {isAuthenticated ? "Back to dashboard" : "Back to home"}
        </Link>

        {/* Guest conversion banner */}
        {!isAuthenticated && showBanner && (
          <div className="sticky top-20 z-30 mt-5 bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5">
            <div className="flex items-start gap-3 sm:gap-4">
              <Sparkles className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-amber-900 text-sm sm:text-base">
                  Save this report and get 37% off forever
                </h3>
                <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                  Create a free account to save your scan history, compare deploys over time, and lock the early-bird pricing before public launch.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/register?next=/reports/${id}`}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-colors shadow-sm"
                  >
                    Sign Up Free
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowBanner(false)}
                    className="text-sm text-amber-600 hover:text-amber-800 px-2 py-1 rounded-md hover:bg-amber-100/60 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className={`rounded-2xl border border-gray-200 bg-white overflow-hidden ${!isAuthenticated && showBanner ? "mt-5" : "mt-5"}`}>
          <div className={`p-6 sm:p-8 bg-gradient-to-br ${scoreBg(report.overallScore)} border-b border-inherit`}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={report.targetUrl.startsWith("http") ? report.targetUrl : `https://${report.targetUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:text-indigo-700 break-all"
                  >
                    <Globe className="w-4 h-4 shrink-0 text-gray-500" />
                    {report.targetUrl}
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                  </a>
                </div>
                <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-gray-950">
                  Deploy Analysis Report
                </h1>
                <p className="mt-1.5 text-sm text-gray-600">
                  Completed {fmtDate(report.completedAt)} · {findings.length} checks run
                </p>
              </div>

              <div className="shrink-0">
                <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/80 backdrop-blur border ${scoreBg(report.overallScore).split(" ").slice(-1)[0]} flex flex-col items-center justify-center shadow-sm`}>
                  <p className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${scoreColor(report.overallScore)}`}>
                    {report.overallScore}
                  </p>
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 mt-0.5">
                    Overall
                  </p>
                </div>
              </div>
            </div>

            {/* Summary counts */}
            {report.summary && (
              <div className="mt-5 flex flex-wrap gap-2">
                {counts.CRITICAL > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-red-200 text-xs font-semibold text-red-700">
                    <AlertCircle className="w-3.5 h-3.5" /> {counts.CRITICAL} Critical
                  </span>
                )}
                {counts.WARNING > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-amber-200 text-xs font-semibold text-amber-700">
                    <AlertTriangle className="w-3.5 h-3.5" /> {counts.WARNING} Warnings
                  </span>
                )}
                {counts.INFO > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-sky-200 text-xs font-semibold text-sky-700">
                    <Info className="w-3.5 h-3.5" /> {counts.INFO} Info
                  </span>
                )}
                {counts.PASS > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-emerald-200 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {counts.PASS} Passed
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Score breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-gray-100">
            {scoreCards.map(({ label, value, Icon }) => (
              <div key={label} className="p-4 sm:p-5 text-center">
                <Icon className={`w-4 h-4 mx-auto ${value == null ? "text-gray-400" : "text-gray-500"}`} />
                <p className={`mt-2 text-2xl font-bold ${scoreColor(value)}`}>
                  {value ?? "—"}
                </p>
                <p className="mt-0.5 text-[11px] uppercase tracking-wider font-semibold text-gray-500">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Top issues summary */}
        {report.summary?.topIssues && report.summary.topIssues.length > 0 && (
          <div className="mt-6 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-violet-50/40 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-indigo-200 flex items-center justify-center shrink-0 text-indigo-600">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-gray-950">AI Summary — What matters most</h3>
                <ul className="mt-3 space-y-2">
                  {report.summary.topIssues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <Lightbulb className="w-4 h-4 mt-0.5 shrink-0 text-indigo-500" />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Findings filters */}
        <div className="mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-950 tracking-tight">
              Findings <span className="text-gray-400 font-medium">({filtered.length})</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              <select
                value={sevFilter}
                onChange={(e) => setSevFilter(e.target.value as SeverityFilter)}
                className="h-9 px-3 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
              >
                <option value="ALL">All severities</option>
                {sevs.map(s => <option key={s} value={s}>{severityStyle(s).label}</option>)}
              </select>
              <select
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value as CategoryFilter)}
                className="h-9 px-3 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
              >
                <option value="ALL">All categories</option>
                {cats.map(c => <option key={c} value={c}>{categoryStyle(c).label}</option>)}
              </select>
            </div>
          </div>

          {/* Category pills */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <button
              onClick={() => setCatFilter("ALL")}
              className={`h-7 px-3 rounded-full text-xs font-semibold transition ${
                catFilter === "ALL"
                  ? "bg-gray-950 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              All
            </button>
            {cats.map((c) => {
              const st = categoryStyle(c);
              const count = findings.filter(f => f.category === c).length;
              const active = catFilter === c;
              return (
                <button
                  key={c}
                  onClick={() => setCatFilter(c)}
                  className={`h-7 px-3 rounded-full text-xs font-semibold transition inline-flex items-center gap-1.5 ${
                    active ? "bg-gray-950 text-white" : st.cls + " hover:opacity-90 border"
                  }`}
                >
                  <st.Icon className="w-3 h-3" /> {st.label}
                  <span className={`${active ? "text-white/70" : "opacity-70"}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Findings list */}
        <div className="mt-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-gray-950">No matching findings</h3>
              <p className="mt-1 text-sm text-gray-600">Try adjusting the filters above.</p>
            </div>
          ) : (
            filtered.map((f) => {
              const st = severityStyle(f.severity);
              const cat = categoryStyle(f.category);
              const open = openFinding === f.id;
              return (
                <div
                  key={f.id}
                  className={`rounded-2xl border bg-white overflow-hidden transition ${
                    f.severity === "CRITICAL" ? "border-red-200"
                      : f.severity === "WARNING" ? "border-amber-200"
                      : "border-gray-200"
                  }`}
                >
                  <button
                    onClick={() => setOpenFinding(open ? null : String(f.id))}
                    className="w-full text-left p-4 sm:p-5 flex items-start gap-3 sm:gap-4 hover:bg-gray-50/60 transition"
                  >
                    <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center ${st.cls} border`}>
                      <st.Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${st.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${cat.cls}`}>
                          <cat.Icon className="w-3 h-3" />
                          {cat.label}
                        </span>
                      </div>
                      <h4 className="mt-2 text-sm sm:text-base font-semibold text-gray-950 leading-snug">
                        {f.title}
                      </h4>
                      {f.description && !open && (
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">{f.description}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-gray-400">
                      {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </button>
                  {open && (
                    <div className="px-4 sm:px-5 pb-5 border-t border-gray-100">
                      <div className="pt-4 space-y-4">
                        {f.description && (
                          <div>
                            <p className="text-[11px] uppercase tracking-wider font-bold text-gray-500">What we found</p>
                            <p className="mt-1.5 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{f.description}</p>
                          </div>
                        )}
                        {f.recommendation && (
                          <div className="rounded-xl bg-emerald-50/50 border border-emerald-200 p-4">
                            <div className="flex items-start gap-2.5">
                              <Lightbulb className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
                              <div>
                                <p className="text-[11px] uppercase tracking-wider font-bold text-emerald-800">How to fix it</p>
                                <p className="mt-1 text-sm text-emerald-900/90 leading-relaxed whitespace-pre-wrap">{f.recommendation}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        {f.impact && (
                          <div>
                            <p className="text-[11px] uppercase tracking-wider font-bold text-gray-500">Impact</p>
                            <p className="mt-1.5 text-sm text-gray-700">{f.impact}</p>
                          </div>
                        )}
                        {f.docsUrl && (
                          <div>
                            <a
                              href={f.docsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                            >
                              Read docs <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer CTA */}
        <div className="mt-10 rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-950 to-gray-800 p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold">Found this report useful?</h3>
              <p className="mt-1 text-sm text-gray-300">
                Run unlimited scans, get priority support, and unlock AI-powered fix suggestions.
              </p>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-white text-gray-950 font-semibold text-sm hover:bg-gray-100 transition shrink-0"
            >
              <Sparkles className="w-4 h-4" /> Upgrade plan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
