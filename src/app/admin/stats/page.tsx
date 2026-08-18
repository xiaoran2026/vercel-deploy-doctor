import { prisma } from "@/lib/server/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin · Stats",
  robots: { index: false, follow: false },
};

function isValidKey(raw: string | null): boolean {
  if (!raw) return false;
  const expected =
    process.env.ADMIN_STATS_KEY ||
    (process.env.JWT_SECRET || "").slice(-8);
  if (!expected) return false;
  // constant-time comparison not critical here, UX matters more
  return raw.trim() === expected.trim();
}

function fmtDate(v: Date | null) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString("zh-CN", { hour12: false });
  } catch {
    return String(v);
  }
}

export default async function AdminStatsPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  if (!isValidKey(key ?? null)) {
    notFound();
  }

  const [
    userCount,
    checkCount,
    reportCount,
    findingCount,
    waitlistCount,
    checksByStatus,
    recentUsers,
    recentChecks,
    waitlistEntries,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.check.count(),
    prisma.report.count(),
    prisma.finding.count(),
    prisma.waitlistEntry.count(),
    prisma.check.groupBy({
      by: ["status"],
      _count: { _all: true },
      orderBy: { status: "asc" },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        email: true,
        createdAt: true,
        _count: { select: { checks: true } },
      },
    }),
    prisma.check.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { email: true } },
        report: { select: { id: true, overallScore: true } },
      },
    }),
    prisma.waitlistEntry.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const totalCheckStatus = checksByStatus.reduce(
    (acc, r) => acc + r._count._all,
    0
  );
  const completedRate = totalCheckStatus
    ? Math.round(
        ((checksByStatus.find((s) => s.status === "COMPLETED")?._count._all ||
          0) /
          totalCheckStatus) *
          100
      )
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">
              Deploy Doctor · Internal
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
              Admin Stats
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Live snapshot · {fmtDate(new Date())}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/"
              className="inline-flex items-center h-9 px-4 rounded-xl bg-white border border-gray-200 text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              ← Home
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center h-9 px-4 rounded-xl bg-gray-950 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* Big 5 KPI cards */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-5 gap-4">
          <KPI label="Users" value={userCount} accent="indigo" />
          <KPI label="Checks run" value={checkCount} accent="violet" />
          <KPI label="Reports" value={reportCount} accent="emerald" />
          <KPI label="Findings" value={findingCount} accent="amber" />
          <KPI label="Waitlist" value={waitlistCount} accent="rose" />
        </div>

        {/* Secondary summary */}
        <div className="mt-6 grid lg:grid-cols-3 gap-4">
          <Card title="Check completion">
            <div className="flex items-center gap-4">
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${completedRate}%` }}
                />
              </div>
              <div className="text-sm font-semibold text-gray-700">
                {completedRate}%
              </div>
            </div>
            <div className="mt-4 space-y-1.5 text-sm">
              {checksByStatus.length === 0 && (
                <div className="text-gray-400">No checks yet.</div>
              )}
              {checksByStatus.map((s) => (
                <div
                  key={s.status}
                  className="flex items-center justify-between text-gray-600"
                >
                  <span className="font-mono text-[12px] uppercase tracking-wide text-gray-500">
                    {s.status}
                  </span>
                  <span className="font-semibold">{s._count._all}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Traffic sources" className="lg:col-span-2">
            <p className="text-xs text-gray-500">
              Check Vercel Project → Analytics for Traffic Sources, Top
              Paths, and Referrers breakdown.
            </p>
            <div className="mt-3 p-4 rounded-xl border border-dashed border-gray-300 bg-white text-xs text-gray-500 leading-relaxed">
              Pro tip: open Vercel Analytics → change time range to
              &ldquo;Last 7 days&rdquo; and compare day-over-day to see the
              impact of each post you publish.
            </div>
          </Card>
        </div>

        {/* Recent users */}
        <Card title={`Recent sign-ups · ${recentUsers.length}/total ${userCount}`} className="mt-6">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-gray-500">
                  <th className="py-2 pr-4 pl-4 sm:pl-0">Email</th>
                  <th className="py-2 pr-4">Signed up</th>
                  <th className="py-2 pr-4 text-right">Checks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentUsers.length === 0 && (
                  <tr>
                    <td
                      className="py-6 pl-4 sm:pl-0 text-sm text-gray-400"
                      colSpan={3}
                    >
                      No sign-ups yet.
                    </td>
                  </tr>
                )}
                {recentUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="py-2.5 pr-4 pl-4 sm:pl-0 font-medium">
                      {u.email}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-500">
                      {fmtDate(u.createdAt)}
                    </td>
                    <td className="py-2.5 pr-4 text-right font-semibold tabular-nums">
                      {u._count.checks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent checks */}
        <Card
          title={`Recent scans · ${recentChecks.length}/total ${checkCount}`}
          className="mt-6"
        >
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-gray-500">
                  <th className="py-2 pr-4 pl-4 sm:pl-0">User</th>
                  <th className="py-2 pr-4">Target URL</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Score</th>
                  <th className="py-2 pr-4">Started</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentChecks.length === 0 && (
                  <tr>
                    <td
                      className="py-6 pl-4 sm:pl-0 text-sm text-gray-400"
                      colSpan={5}
                    >
                      No scans yet.
                    </td>
                  </tr>
                )}
                {recentChecks.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2.5 pr-4 pl-4 sm:pl-0 font-medium">
                      {c.user?.email ? c.user.email : <span className="text-gray-400 italic">Guest</span>}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-600 font-mono text-[12px] truncate max-w-[220px]">
                      {c.targetUrl}
                    </td>
                    <td className="py-2.5 pr-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-2.5 pr-4 font-semibold tabular-nums">
                      {c.report ? `${c.report.overallScore}/100` : "—"}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-500">
                      {fmtDate(c.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Waitlist entries */}
        <Card title={`Waitlist entries · ${waitlistCount}`} className="mt-6">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-gray-500">
                  <th className="py-2 pr-4 pl-4 sm:pl-0">Email</th>
                  <th className="py-2 pr-4">Plan</th>
                  <th className="py-2 pr-4">Source</th>
                  <th className="py-2 pr-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {waitlistEntries.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 pl-4 sm:pl-0 text-sm text-gray-400">
                      No waitlist entries yet.
                    </td>
                  </tr>
                )}
                {waitlistEntries.map((entry: any) => (
                  <tr key={entry.id}>
                    <td className="py-2.5 pr-4 pl-4 sm:pl-0 font-medium">
                      {entry.email}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-600">{entry.plan}</td>
                    <td className="py-2.5 pr-4 text-gray-600">{entry.source || "—"}</td>
                    <td className="py-2.5 pr-4 text-gray-500">{fmtDate(entry.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <p className="mt-10 text-center text-xs text-gray-400">
          Keep the ?key= query parameter secret. Rotate it any time by
          setting the ADMIN_STATS_KEY env var in Vercel.
        </p>
      </div>
    </div>
  );
}

function KPI({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "indigo" | "violet" | "emerald" | "amber" | "rose";
}) {
  const dot = {
    indigo: "bg-indigo-500",
    violet: "bg-violet-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
  }[accent];
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        {label}
      </div>
      <div className="mt-3 text-3xl font-bold tracking-tight tabular-nums">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function Card({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm ${className}`}
    >
      <h2 className="text-sm font-semibold text-gray-800 tracking-tight mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    QUEUED: "bg-gray-100 text-gray-700 border-gray-200",
    RUNNING:
      "bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse",
    COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    FAILED: "bg-rose-50 text-rose-700 border-rose-200",
  };
  const cls =
    map[status] || "bg-gray-100 text-gray-600 border border-gray-200";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${cls}`}
    >
      {status}
    </span>
  );
}
