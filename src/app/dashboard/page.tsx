"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { CheckStatus, ReportListItem } from "@/lib/types";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Globe,
  Info,
  Loader2,
  Plus,
  Search,
  Sparkles,
  ExternalLink,
  Gauge,
  ShieldCheck,
  BarChart3,
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
function scoreBar(score: number) {
  if (score >= 90) return "bg-emerald-500";
  if (score >= 70) return "bg-amber-500";
  if (score >= 50) return "bg-orange-500";
  return "bg-red-500";
}
function statusBadge(status: CheckStatus) {
  switch (status) {
    case "COMPLETED": return { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Done", Icon: CheckCircle2 };
    case "RUNNING":   return { cls: "bg-sky-50 text-sky-700 border-sky-200", label: "Running", Icon: Loader2 };
    case "QUEUED":    return { cls: "bg-gray-100 text-gray-700 border-gray-200", label: "Queued", Icon: Clock };
    case "FAILED":    return { cls: "bg-red-50 text-red-700 border-red-200", label: "Failed", Icon: AlertCircle };
    case "CANCELLED": return { cls: "bg-gray-100 text-gray-700 border-gray-200", label: "Cancelled", Icon: AlertTriangle };
  }
}

type CheckRow = {
  id: string;
  targetUrl: string;
  status: CheckStatus;
  progress: number;
  currentStep: string | null;
  errorMessage: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  report: { id: string; overallScore: number; status: string } | null;
};

export default function DashboardPage() {
  const [checks, setChecks] = useState<CheckRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // Form
  const [targetUrl, setTargetUrl] = useState("");
  const [opts, setOpts] = useState({ perf: true, sec: true, lh: true, cfg: true });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingCheckId, setPendingCheckId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<any>(`/checks?page=${page}&size=20`);
      const payload = res.data?.data ?? res.data;
      setChecks(payload.items ?? []);
      setTotal(payload.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { void load(); }, [load]);

  // Poll pending check status
  useEffect(() => {
    if (!pendingCheckId) return;
    const id = pendingCheckId;
    const timer = setInterval(async () => {
      try {
        const res = await api.get<any>(`/checks/${id}`);
        const payload = res.data?.data ?? res.data;
        const s: CheckStatus = payload.status;
        if (s === "COMPLETED" || s === "FAILED" || s === "CANCELLED") {
          clearInterval(timer);
          setPendingCheckId(null);
          await load();
        } else {
          setChecks((list) =>
            list.map((c) =>
              c.id === id
                ? { ...c, status: s, progress: payload.progress ?? c.progress, currentStep: payload.currentStep ?? c.currentStep }
                : c
            )
          );
        }
      } catch { /* ignore, next poll */ }
    }, 2000);
    return () => clearInterval(timer);
  }, [pendingCheckId, load]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!targetUrl.trim()) { setError("Enter a deployed URL to scan."); return; }
    setSubmitting(true);
    try {
      const res = await api.post<any>("/checks", {
        targetUrl: targetUrl.trim(),
        includePerformance: opts.perf,
        includeSecurity: opts.sec,
        includeLighthouse: opts.lh,
        includeConfig: opts.cfg,
      });
      const payload = res.data?.data ?? res.data;
      setPendingCheckId(payload.checkId);
      setTargetUrl("");
      // Prepend a synthetic optimistic row
      const synth: CheckRow = {
        id: payload.checkId,
        targetUrl: targetUrl.trim(),
        status: payload.status ?? "RUNNING",
        progress: payload.progress ?? 10,
        currentStep: payload.currentStep ?? "Starting",
        errorMessage: null,
        createdAt: new Date().toISOString(),
        startedAt: new Date().toISOString(),
        completedAt: null,
        report: payload.reportId ? { id: payload.reportId, overallScore: 0, status: "COMPLETED" } : null,
      };
      setChecks((c) => [synth, ...c]);
      setTotal((t) => t + 1);
    } catch (err: any) {
      setError(err?.message ?? "Could not start check.");
    } finally {
      setSubmitting(false);
    }
  };

  const avgScore = (() => {
    const scored = checks
      .map((c) => c.report?.overallScore)
      .filter((n): n is number => typeof n === "number");
    if (!scored.length) return null;
    return Math.round(scored.reduce((a, b) => a + b, 0) / scored.length);
  })();
  const completedCount = checks.filter((c) => c.status === "COMPLETED").length;
  const failedCount = checks.filter((c) => c.status === "FAILED").length;
  const runningCount = checks.filter((c) => c.status === "RUNNING" || c.status === "QUEUED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-gray-400">Dashboard</p>
          <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">Deploy checks</h1>
          <p className="mt-1.5 text-sm text-gray-600">Scan any Vercel URL and catch regressions before your users do.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/pricing" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-800 hover:bg-gray-50">
            <Sparkles className="w-4 h-4 text-amber-500" /> Upgrade plan
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Avg score", value: avgScore == null ? "—" : avgScore, Icon: Gauge, color: avgScore == null ? "" : scoreColor(avgScore), sub: avgScore == null ? "No checks yet" : "Across completed" },
          { label: "Checks", value: total, Icon: Activity, sub: `Showing ${checks.length}` },
          { label: "Completed", value: completedCount, Icon: CheckCircle2, sub: `${failedCount} failed` },
          { label: "In progress", value: runningCount, Icon: Loader2, sub: runningCount ? "Polling every 2s" : "All idle" },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-400">{s.label}</p>
              <s.Icon className="w-4 h-4 text-gray-400" />
            </div>
            <p className={`mt-2 text-3xl font-bold tracking-tight ${s.color ?? "text-gray-950"}`}>{s.value}</p>
            <p className="mt-1 text-[11px] text-gray-500">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* New check card */}
      <form onSubmit={onSubmit} className="p-5 rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/60">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-gray-950 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Start a new deploy check
            </p>
            <p className="mt-0.5 text-xs text-gray-500">Paste any production or preview URL. Average scan time: 30 seconds.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-2.5 p-1.5 rounded-2xl border border-gray-200 bg-white">
          <div className="flex items-center gap-2 flex-1 px-3">
            <Globe className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="your-app.vercel.app or custom domain"
              className="flex-1 h-11 bg-transparent outline-none text-sm placeholder:text-gray-400 min-w-0"
              disabled={submitting}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-gray-950 text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60 whitespace-nowrap"
          >
            {submitting ? <>
              <Loader2 className="w-4 h-4 animate-spin" /> Starting scan…
            </> : <>
              <Search className="w-4 h-4" /> Scan Deploy
            </>}
          </button>
        </div>

        {/* Option toggles */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-600">
          <Toggle label="Performance" id="p-perf" checked={opts.perf} onChange={(v) => setOpts((o) => ({ ...o, perf: v }))} Icon={Gauge} />
          <Toggle label="Security" id="p-sec" checked={opts.sec} onChange={(v) => setOpts((o) => ({ ...o, sec: v }))} Icon={ShieldCheck} />
          <Toggle label="SEO + A11y" id="p-lh" checked={opts.lh} onChange={(v) => setOpts((o) => ({ ...o, lh: v }))} Icon={BarChart3} />
          <Toggle label="Deploy Config" id="p-cfg" checked={opts.cfg} onChange={(v) => setOpts((o) => ({ ...o, cfg: v }))} Icon={Activity} />
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </form>

      {/* List */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-950">Recent checks</p>
          {checks.length > 0 && (
            <p className="text-[11px] text-gray-500">
              {total} total · page {page} · &nbsp;
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-gray-700 hover:text-gray-950 disabled:text-gray-300"
              >Prev</button>
              &nbsp;·&nbsp;
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * 20 >= total}
                className="text-gray-700 hover:text-gray-950 disabled:text-gray-300"
              >Next</button>
            </p>
          )}
        </div>

        {loading ? (
          <div className="p-10 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : checks.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y divide-gray-100">
            {checks.map((c) => {
              const sb = statusBadge(c.status);
              const StatusIcon = sb.Icon;
              return (
                <div key={c.id} className="px-5 py-4 hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={(c.targetUrl.startsWith("http") ? "" : "https://") + c.targetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-950 hover:text-indigo-700 truncate"
                        >
                          <span className="truncate">{c.targetUrl}</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-40 shrink-0" />
                        </a>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${sb.cls}`}>
                          <StatusIcon className={`w-3 h-3 ${sb.label === "Running" ? "animate-spin" : ""}`} />
                          {sb.label}
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
                        <span>Started {fmtDate(c.createdAt)}</span>
                        {c.currentStep && c.status === "RUNNING" && (
                          <span className="inline-flex items-center gap-1 text-sky-700">
                            <Loader2 className="w-3 h-3 animate-spin" /> {c.currentStep}
                          </span>
                        )}
                        {c.errorMessage && (
                          <span className="inline-flex items-center gap-1 text-red-600">
                            <AlertCircle className="w-3 h-3" /> {c.errorMessage}
                          </span>
                        )}
                      </div>
                      {c.status === "RUNNING" && (
                        <div className="mt-2.5 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden max-w-md">
                          <div className="h-full bg-sky-500 transition-all" style={{ width: `${c.progress}%` }} />
                        </div>
                      )}
                    </div>

                    {/* Score */}
                    <div className="shrink-0 text-right min-w-[92px]">
                      {c.report ? (
                        <>
                          <p className={`text-2xl font-bold tracking-tight ${scoreColor(c.report.overallScore)}`}>
                            {c.report.overallScore}
                          </p>
                          <div className="mt-1 h-1.5 w-20 rounded-full bg-gray-100 overflow-hidden ml-auto">
                            <div className={`h-full ${scoreBar(c.report.overallScore)}`} style={{ width: `${c.report.overallScore}%` }} />
                          </div>
                          <Link
                            href={`/reports/${c.report.id}`}
                            className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                          >
                            View report <ArrowRight className="w-3 h-3" />
                          </Link>
                        </>
                      ) : (
                        <p className="text-xs text-gray-400">—</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Toggle({ label, id, checked, onChange, Icon }:
  { label: string; id: string; checked: boolean; onChange: (v: boolean) => void; Icon?: any }) {
  return (
    <label htmlFor={id} className="inline-flex items-center gap-2 select-none cursor-pointer">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
      {Icon && <Icon className="w-3.5 h-3.5 text-gray-500" />}
      <span className="font-medium">{label}</span>
    </label>
  );
}

function EmptyState() {
  return (
    <div className="p-14 text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 text-gray-500 flex items-center justify-center">
        <Activity className="w-7 h-7" />
      </div>
      <p className="mt-4 text-sm font-semibold text-gray-950">No checks yet</p>
      <p className="mt-1.5 text-sm text-gray-600 max-w-sm mx-auto">
        Paste any Vercel URL above. We'll scan deploy config, headers,
        caching, SEO, a11y, and performance in under 30 seconds.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold text-gray-500">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-gray-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Security headers
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-gray-200">
          <Gauge className="w-3.5 h-3.5 text-amber-600" /> Cache-control
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-gray-200">
          <BarChart3 className="w-3.5 h-3.5 text-sky-600" /> SEO & A11y
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-gray-200">
          <Info className="w-3.5 h-3.5 text-violet-600" /> vercel.json audit
        </span>
      </div>
    </div>
  );
}
