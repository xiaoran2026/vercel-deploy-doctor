"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Check,
  Clock,
  Gauge,
  Globe,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Wand2,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Info,
  AlertCircle,
  BarChart3,
  RefreshCw,
  Bell,
  FileText,
  Palette,
  Rocket,
} from "lucide-react";
import { useState } from "react";

const scoreColor = (score: number) => {
  if (score >= 90) return "text-emerald-600";
  if (score >= 70) return "text-amber-600";
  if (score >= 50) return "text-orange-600";
  return "text-red-600";
};
const scoreBg = (score: number) => {
  if (score >= 90) return "bg-emerald-500";
  if (score >= 70) return "bg-amber-500";
  if (score >= 50) return "bg-orange-500";
  return "bg-red-500";
};

const problems = [
  {
    icon: ShieldCheck,
    title: "Missing security headers",
    desc: "CSP, HSTS, X-Frame-Options are off by default on Vercel — you're shipping an attack surface.",
  },
  {
    icon: Gauge,
    title: "Caching you forgot to set",
    desc: "Static assets served without Cache-Control mean slower TTFB, wasted Edge bandwidth, higher bills.",
  },
  {
    icon: AlertTriangle,
    title: "vercel.json misconfigured",
    desc: "Wrong regions, oversized functions, missing rewrites — users get 500s and cold starts you never see.",
  },
  {
    icon: Globe,
    title: "SEO meta tags empty",
    desc: "Deploy landed with blank og:image or missing canonical. Paid traffic converted worse since release.",
  },
  {
    icon: Zap,
    title: "Performance regression",
    desc: "Bundle size grew 40% in last deploy. Lighthouse dropped 20 pts. Nobody noticed the diff.",
  },
  {
    icon: Lock,
    title: "Env leaks in client bundle",
    desc: "A stray NEXT_PUBLIC_ pushed a DB string to the browser. You only found out because a screenshot went viral.",
  },
];

const steps = [
  {
    icon: Globe,
    title: "Paste your Vercel URL",
    desc: "Drop in any deployed URL — app.vercel.app or custom domain. No install, no token, no config.",
  },
  {
    icon: Search,
    title: "We scan 40+ deployment checks",
    desc: "Deploy config, headers, caching, performance, a11y, SEO, security best practices — in under 30 seconds.",
  },
  {
    icon: Wand2,
    title: "Get a fix plan with code snippets",
    desc: "Every finding ships with a copy-pasteable next.config.js / vercel.json fix and Vercel docs link.",
  },
];

const features = [
  {
    icon: TerminalSquare,
    category: "Deploy Config",
    title: "vercel.json best-practice audit",
    desc: "Regions, function sizing, rewrites, redirects, ISR params, Edge vs Node — we flag the defaults that hurt real users.",
  },
  {
    icon: Gauge,
    category: "Performance",
    title: "Lighthouse + Edge TTFB",
    desc: "Core Web Vitals from multiple regions. Bundle size regressions caught before they become a Friday night page.",
  },
  {
    icon: Lock,
    category: "Security",
    title: "Headers + env leak scan",
    desc: "CSP, HSTS, Referrer-Policy, X-Content-Type, clickjacking protection, and client-bundle env leak detection.",
  },
  {
    icon: Globe,
    category: "SEO & Social",
    title: "Meta, OG, and canonical",
    desc: "og:image sizes, Twitter cards, canonical URLs, noindex traps, sitemap/robots — the deploy-time SEO checklist.",
  },
  {
    icon: Activity,
    category: "Accessibility",
    title: "A11y baseline",
    desc: "Landmark regions, color contrast, alt text, heading order, ARIA usage — the subset that ships regressions most often.",
  },
  {
    icon: Zap,
    category: "CI Integration",
    title: "Block bad deploys",
    desc: "Run the doctor in GitHub Actions / Vercel Checks. Block the merge if score drops below your team's threshold.",
  },
];

const pricing = [
  {
    name: "Free",
    price: "$0",
    tagline: "For indie hackers validating their latest deploy",
    cta: "Start Free",
    href: "/register",
    features: [
      "3 deploy checks / month",
      "Deploy health score",
      "Lighthouse (Perf / A11y / SEO)",
      "Security header scan",
      "vercel.json audit",
      "Finding details",
    ],
    badge: null as string | null,
  },
  {
    name: "Starter",
    price: "$12",
    originalPrice: "$19",
    tagline: "Early-bird · For solo founders shipping side projects",
    cta: "Get Early Access",
    href: "/register",
    features: [
      "50 deploy checks / month",
      "Everything in Free",
      "AI-generated fix recipes with code snippets",
      "Deploy trend history (30 days)",
      "Shareable public report links",
      "Export report as Markdown",
    ],
    badge: "Early Bird · -37%",
    highlight: false,
  },
  {
    name: "Growth",
    price: "$32",
    originalPrice: "$49",
    tagline: "Early-bird · For product teams running paid traffic",
    cta: "Reserve Growth Seat",
    href: "/register",
    features: [
      "Unlimited deploy checks",
      "Everything in Starter",
      "Scheduled daily/weekly checks",
      "Slack / email alerts on regressions",
      "Unlimited trend & comparison history",
      "API access for CI/CD integration",
      "PDF export with brand colors",
    ],
    badge: "Most Popular",
    highlight: true,
  },
  {
    name: "Agency",
    price: "$99",
    originalPrice: "$149",
    tagline: "Early-bird · For agencies delivering deploy quality to clients",
    cta: "Talk to Us",
    href: "mailto:founders@deploydoctor.dev",
    features: [
      "Everything in Growth",
      "White-label reports (your logo)",
      "Multi-project workspaces",
      "Client shareable dashboard",
      "Priority support (SLA 24h)",
      "SSO & team roles (coming soon)",
      "Custom check recipes (coming soon)",
    ],
    badge: "Agency Offer",
    highlight: false,
  },
];

const useCases = [
  {
    icon: Rocket,
    title: "Indie hackers launching fast",
    desc: "Ship 5 Vercel projects a month? Don't let a caching misconfig or missing og:image tank your launch day conversion.",
  },
  {
    icon: BarChart3,
    title: "SaaS teams on paid traffic",
    desc: "Each deploy is a $ spend. You need to know — before the alert — that LCP regressed and forms are not focusable.",
  },
  {
    icon: Palette,
    title: "Agencies shipping client work",
    desc: "Deliver a deploy-quality report with every handoff. Turn 'looks fine on my machine' into a quantified artifact.",
  },
];

const faqs = [
  {
    q: "Do I need to install anything or share Vercel tokens?",
    a: "No. Paste any public Vercel URL. Deploy Doctor works from the outside in — no auth, no CLI, no Github app install. (CI/CD integration is opt-in, Growth and above.)",
  },
  {
    q: "What exactly gets checked in one scan?",
    a: "~40 checks across 6 categories: deploy config (vercel.json), HTTP headers & security, caching & performance, Lighthouse (PWA / A11y / SEO basics), meta/social tags, and common Next.js pitfalls. We add new rules every week.",
  },
  {
    q: "How is this different from Vercel's built-in Analytics?",
    a: "Vercel Analytics shows you traffic and Web Vitals after users arrive. Deploy Doctor runs pre-launch and tells you exactly which vercel.json / header / meta line to change — with the code snippet — before your next deploy ships.",
  },
  {
    q: "Can I run it in CI to block bad deploys?",
    a: "Yes. Growth plan exposes a small REST API. Point GitHub Actions or Vercel Checks at it, set a score threshold (e.g. overall >= 85, deployHealth >= 90), and the PR fails until the issue is fixed.",
  },
  {
    q: "Is there a discount for early supporters?",
    a: "Yes. During the pre-launch waitlist, all paid plans are 37% off forever. Lock in the early-bird price by creating a free account before GA.",
  },
  {
    q: "Do you store the contents of my pages?",
    a: "No. We fetch public HTTP responses, extract the metrics we need, and discard raw HTML within 24 hours. Only the aggregate score and findings are kept in your account.",
  },
];

const sampleFindings = [
  { severity: "critical", category: "SECURITY", title: "Missing Content-Security-Policy header", desc: "No CSP detected. XSS payloads can execute inline scripts.", rec: "Add CSP header in vercel.json with a strict default-src policy." },
  { severity: "warning", category: "DEPLOY", title: "Static assets served without Cache-Control", desc: "/_next/static/* returns cache-control: public, max-age=0. Users re-download unchanged bundles.", rec: "Add vercel.json header rule: `/_next/static/*` → `public, max-age=31536000, immutable`." },
  { severity: "warning", category: "SEO", title: "og:image missing or wrong size", desc: "og:image not set. Social shares fall back to empty preview — losing up to 30% CTR.", rec: "Add a 1200×630 og:image and corresponding og:width/og:height meta tags." },
  { severity: "info", category: "PERFORMANCE", title: "Unused JS: 87 KB from vendor chunk", desc: "Largest contentful paint 2.8s — 430 KB JS of which 87 KB is unused in landing route.", rec: "Split vendor bundle with dynamic imports. Consider route-level code splitting." },
];

function SeverityPill({ s }: { s: string }) {
  const map: Record<string, { cls: string; icon: any; label: string }> = {
    critical: { cls: "bg-red-50 text-red-700 border-red-200", icon: AlertCircle, label: "Critical" },
    warning: { cls: "bg-amber-50 text-amber-700 border-amber-200", icon: AlertTriangle, label: "Warning" },
    info: { cls: "bg-sky-50 text-sky-700 border-sky-200", icon: Info, label: "Info" },
    pass: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2, label: "Pass" },
  };
  const cfg = map[s] ?? map.info;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${cfg.cls}`}>
      <Icon className="w-3 h-3" /> {cfg.label}
    </span>
  );
}

export default function HomePage() {
  const [url, setUrl] = useState("");

  return (
    <div className="min-h-screen bg-white text-gray-950 antialiased">
      {/* ============ HEADER ============ */}
      <header className="border-b border-gray-200/70 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-950 to-gray-700 text-white flex items-center justify-center shadow-sm">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight leading-tight">Deploy Doctor</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.18em]">for Vercel</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm text-gray-600">
            <a href="#how" className="hover:text-gray-950 transition-colors">How It Works</a>
            <a href="#features" className="hover:text-gray-950 transition-colors">Checks</a>
            <a href="#usecases" className="hover:text-gray-950 transition-colors">Use Cases</a>
            <a href="#pricing" className="hover:text-gray-950 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-gray-950 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:inline-flex items-center px-3.5 py-2 text-sm font-semibold text-gray-700 hover:text-gray-950 transition-colors">
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-gray-950 text-white hover:bg-gray-800 transition-colors shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_1px_2px_rgba(0,0,0,0.08)]"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Join Waitlist
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ============ HERO ============ */}
        <section className="relative overflow-hidden border-b border-gray-200/70">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(99,102,241,0.12),transparent_70%),radial-gradient(ellipse_60%_50%_at_10%_10%,rgba(16,185,129,0.08),transparent_60%),radial-gradient(ellipse_60%_50%_at_90%_20%,rgba(251,146,60,0.08),transparent_60%)]" />
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white text-[11px] font-semibold text-gray-600">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Pre-launch · All paid plans 37% off forever for waitlist members
              </div>

              <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.03em] leading-[1.02]">
                Ship deploys that
                <span className="block bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-600 bg-clip-text text-transparent">
                  don't silently break.
                </span>
              </h1>

              <p className="mt-5 text-lg text-gray-600 leading-relaxed max-w-xl">
                Paste any Vercel URL. Get a 40+ point deploy audit in under 30 seconds — security headers,
                caching, vercel.json, performance, SEO, a11y — with the exact code snippet to fix each finding.
              </p>

              {/* Input — No signup Quick Scan */}
              <form
                className="mt-8 max-w-xl"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!url.trim()) return;
                  window.location.href = `/check?url=${encodeURIComponent(url.trim())}`;
                }}
              >
                <div className="flex flex-col sm:flex-row gap-2.5 p-1.5 rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_32px_rgba(15,23,42,0.06)]">
                  <div className="flex items-center gap-2 flex-1 px-3">
                    <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="my-next-app.vercel.app or your custom domain"
                      className="flex-1 h-11 bg-transparent outline-none text-sm placeholder:text-gray-400 min-w-0"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-gray-950 text-white text-sm font-semibold hover:bg-gray-800 transition-colors whitespace-nowrap"
                  >
                    Scan My Deploy
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-medium text-gray-500">
                  <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> No signup required</span>
                  <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Under 30 seconds</span>
                  <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Free scan</span>
                </div>
              </form>
            </div>

            {/* ============ SCORE PREVIEW CARD ============ */}
            <div className="lg:justify-self-end w-full">
              <div className="bg-white rounded-3xl border border-gray-200 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.18)] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-950 to-gray-700 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">Deploy Report · Preview</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">my-next-app.vercel.app</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
                    Sample
                  </span>
                </div>

                <div className="p-6">
                  {/* Score */}
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">Overall Deploy Health</p>
                      <p className={`mt-1 text-5xl font-bold tracking-tight ${scoreColor(68)}`}>68<span className="text-base text-gray-400 font-semibold">/100</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Score bar</p>
                      <div className="w-40 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div className={`h-full ${scoreBg(68)}`} style={{ width: "68%" }} />
                      </div>
                      <div className="mt-2 grid grid-cols-4 gap-1.5 text-right">
                        {[
                          { label: "Deploy", v: 72 },
                          { label: "Perf", v: 58 },
                          { label: "A11y", v: 84 },
                          { label: "Sec", v: 52 },
                        ].map((m) => (
                          <div key={m.label}>
                            <p className="text-[9px] uppercase tracking-wider text-gray-400">{m.label}</p>
                            <p className={`text-sm font-bold ${scoreColor(m.v)}`}>{m.v}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="mt-5 grid grid-cols-3 gap-2.5 text-center">
                    {[
                      { label: "Critical", v: 2, cls: "bg-red-50 text-red-700 border-red-100" },
                      { label: "Warnings", v: 7, cls: "bg-amber-50 text-amber-700 border-amber-100" },
                      { label: "Passed", v: 31, cls: "bg-emerald-50 text-emerald-700 border-emerald-100" },
                    ].map((c) => (
                      <div key={c.label} className={`p-3 rounded-xl border ${c.cls}`}>
                        <p className="text-2xl font-bold leading-none">{c.v}</p>
                        <p className="text-[10px] uppercase tracking-wider mt-1 opacity-80">{c.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Top Findings preview */}
                  <div className="mt-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400 mb-2.5">Top Findings</p>
                    <div className="space-y-2">
                      {sampleFindings.slice(0, 2).map((f, i) => (
                        <div key={i} className="p-3 rounded-xl border border-gray-100 bg-gray-50/60">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-gray-900 leading-tight">{f.title}</p>
                            <SeverityPill s={f.severity} />
                          </div>
                          <p className="mt-1.5 text-xs text-gray-600 line-clamp-1">{f.desc}</p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-[11px] text-gray-500">+ 35 more findings with fix snippets →</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ SOCIAL PROOF / PROBLEMS INTRO ============ */}
        <section className="py-14 md:py-16 border-b border-gray-200/70">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">The problem</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
                Most Vercel deploys ship with <span className="text-rose-600">3–8 silent issues</span> you'll only find after a user complains.
              </h2>
              <p className="mt-4 text-base text-gray-600 leading-relaxed">
                You pushed to prod on Friday. Your team's excited. But nobody checked the headers.
                Nobody diff'd the bundle size. Nobody tested from another region.
                Monday morning: support tickets, paid traffic under-converting, a security tweet.
              </p>
            </div>
            <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {problems.map((p) => (
                <div key={p.title} className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                    <p.icon className="w-5 h-5" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-gray-950">{p.title}</p>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section id="how" className="py-16 md:py-20 bg-gray-50/60 border-b border-gray-200/70">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">How It Works</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">A deploy audit in 3 steps. Zero setup.</h2>
              <p className="mt-4 text-base text-gray-600 leading-relaxed">
                No Github app, no Vercel token, no CLI. Run your first check before your coffee gets cold.
              </p>
            </div>
            <div className="mt-10 grid md:grid-cols-3 gap-4">
              {steps.map((s, i) => (
                <div key={s.title} className="relative p-6 rounded-2xl border border-gray-200 bg-white">
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-lg bg-gray-950 text-white text-xs font-bold flex items-center justify-center shadow-md">
                    {i + 1}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 text-white flex items-center justify-center shadow-sm">
                    <s.icon className="w-5 h-5" />
                  </div>
                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">Step {i + 1}</p>
                  <h3 className="mt-2 text-lg font-semibold text-gray-950">{s.title}</h3>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ FEATURES ============ */}
        <section id="features" className="py-16 md:py-20 border-b border-gray-200/70">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
              <div className="max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">What's Checked</p>
                <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">6 categories. 40+ rules. Actionable output.</h2>
                <p className="mt-4 text-base text-gray-600 leading-relaxed">
                  Every finding comes with severity, impact, and a copy-pasteable fix — usually a vercel.json header block,
                  a next.config.js stanza, or the exact meta tags to add.
                </p>
              </div>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors self-start"
              >
                See full rule list
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((f) => (
                <div key={f.title} className="group p-6 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.15)] transition-all">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center ring-1 ring-indigo-100 group-hover:scale-105 transition-transform">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">{f.category}</p>
                  <h3 className="mt-1 text-lg font-semibold text-gray-950">{f.title}</h3>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ SAMPLE FINDINGS / REPORT PREVIEW ============ */}
        <section className="py-16 md:py-20 bg-gray-50/60 border-b border-gray-200/70">
          <div className="max-w-6xl mx-auto px-4 md:px-6 grid lg:grid-cols-[0.8fr_1.2fr] gap-10 items-start">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">What a report looks like</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
                Not a vague dashboard.<br />A fix list with code.
              </h2>
              <p className="mt-4 text-base text-gray-600 leading-relaxed">
                Each finding has severity, category, impact, and a concrete recommendation —
                often with a vercel.json / next.config.js snippet you can paste and ship.
              </p>
              <div className="mt-6 space-y-3 text-sm text-gray-700">
                {[
                  "Relevant Vercel / Next.js docs link for every rule",
                  "Rule IDs you can mark as accepted / false-positive",
                  "Trend across your last 10 deploys (Starter+)",
                  "Shareable public link or PDF export",
                ].map((b) => (
                  <div key={b} className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.25)] overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-gray-300" />
                    <span className="w-3 h-3 rounded-full bg-gray-300" />
                    <span className="w-3 h-3 rounded-full bg-gray-300" />
                  </div>
                  <p className="ml-3 text-xs font-mono text-gray-500">deploy.doctor/r/preview · my-next-app.vercel.app</p>
                </div>
                <span className="text-[10px] font-semibold text-gray-500 px-2 py-0.5 rounded-md bg-gray-100">v1 · Report</span>
              </div>

              <div className="p-5 space-y-3 max-h-[560px] overflow-y-auto">
                {sampleFindings.map((f, i) => (
                  <div key={i} className="rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <SeverityPill s={f.severity} />
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{f.category}</span>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-gray-950">{f.title}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-600 leading-relaxed">{f.desc}</p>
                    <div className="mt-3 p-3 rounded-xl bg-gray-950 overflow-x-auto">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Recommended fix</p>
                      <pre className="text-[11px] leading-relaxed text-gray-200 font-mono whitespace-pre-wrap">{f.rec}</pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ USE CASES ============ */}
        <section id="usecases" className="py-16 md:py-20 border-b border-gray-200/70">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">Who it's for</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">Built for the three people that care about deploys.</h2>
            </div>
            <div className="mt-10 grid md:grid-cols-3 gap-4">
              {useCases.map((u) => (
                <div key={u.title} className="p-6 rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-sm">
                    <u.icon className="w-5 h-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-gray-950">{u.title}</h3>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">{u.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ PRICING ============ */}
        <section id="pricing" className="py-16 md:py-20 bg-gray-50/60 border-b border-gray-200/70">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Pre-launch pricing · All paid tiers 37% OFF · Locked in forever
              </div>
              <h2 className="mt-6 text-3xl md:text-5xl font-bold tracking-tight">
                Simple, honest pricing.
              </h2>
              <p className="mt-4 text-base text-gray-600 leading-relaxed">
                Start free forever. Upgrade when you want scheduled checks, CI integration, and AI fix recipes.
                Cancel anytime.
              </p>
            </div>

            <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {pricing.map((p) => {
                const highlight = p.highlight;
                return (
                  <div
                    key={p.name}
                    className={`relative p-6 rounded-3xl border flex flex-col ${
                      highlight
                        ? "bg-gray-950 text-white border-gray-950 shadow-[0_20px_60px_-15px_rgba(79,70,229,0.45)] scale-[1.02]"
                        : "bg-white text-gray-950 border-gray-200"
                    }`}
                  >
                    {p.badge && (
                      <span
                        className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                          highlight
                            ? "bg-amber-400 text-gray-950 shadow-[0_4px_12px_-4px_rgba(251,191,36,0.8)]"
                            : "bg-indigo-600 text-white shadow-[0_4px_12px_-4px_rgba(79,70,229,0.6)]"
                        }`}
                      >
                        {p.badge}
                      </span>
                    )}
                    <div>
                      <p className={`text-base font-bold ${highlight ? "text-white" : "text-gray-950"}`}>{p.name}</p>
                      <p className={`mt-1 text-xs ${highlight ? "text-white/60" : "text-gray-500"}`}>{p.tagline}</p>
                    </div>
                    <div className="mt-5 flex items-end gap-1.5">
                      <p className={`text-4xl font-bold tracking-tight ${highlight ? "text-white" : "text-gray-950"}`}>{p.price}</p>
                      {p.originalPrice && (
                        <p className={`text-sm mb-1 font-medium line-through ${highlight ? "text-white/40" : "text-gray-400"}`}>
                          {p.originalPrice}
                        </p>
                      )}
                      <p className={`text-sm mb-1 font-medium ${highlight ? "text-white/60" : "text-gray-500"}`}>
                        {p.name !== "Free" ? "/mo" : ""}
                      </p>
                    </div>

                    <Link
                      href={p.href}
                      className={`mt-5 inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl text-sm font-semibold transition-colors ${
                        highlight
                          ? "bg-white text-gray-950 hover:bg-gray-100"
                          : "bg-gray-950 text-white hover:bg-gray-800"
                      }`}
                    >
                      {p.cta}
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

            <p className="mt-8 text-center text-xs text-gray-500">
              All prices in USD. Early-bird discount locks in when you create an account during pre-launch.
            </p>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section id="faq" className="py-16 md:py-20 border-b border-gray-200/70">
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            <div className="text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">FAQ</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">Questions teams usually ask first</h2>
            </div>

            <div className="mt-10 space-y-3">
              {faqs.map((item) => (
                <div key={item.q} className="rounded-2xl border border-gray-200 bg-white p-5 hover:border-gray-300 transition-colors">
                  <p className="text-sm font-semibold text-gray-950">{item.q}</p>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ FINAL CTA ============ */}
        <section className="relative overflow-hidden py-20 md:py-24 bg-gray-950 text-white">
          <div className="absolute inset-0 -z-10 opacity-40 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(99,102,241,0.35),transparent_60%),radial-gradient(ellipse_40%_40%_at_80%_100%,rgba(16,185,129,0.25),transparent_60%)]" />
          <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] font-semibold text-white/80">
              <Clock className="w-3.5 h-3.5" />
              Early-bird offer ends at public launch
            </div>
            <h2 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight">
              Your next deploy ships tomorrow.
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                Make it the first one without regressions.
              </span>
            </h2>
            <p className="mt-4 text-base text-white/65 max-w-2xl mx-auto">
              Join the pre-launch waitlist. Lock in a 37% lifetime discount.
              Your first check runs in under 30 seconds.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-gray-950 text-sm font-semibold hover:bg-gray-100 transition-colors shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_8px_24px_-8px_rgba(99,102,241,0.5)]"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                Join Waitlist — It's Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/15 text-white text-sm font-semibold hover:bg-white/5 transition-colors"
              >
                Compare plans
              </a>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-5 text-[11px] font-medium text-white/50">
              <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> No credit card</span>
              <span className="inline-flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5 text-emerald-400" /> Cancel anytime</span>
              <span className="inline-flex items-center gap-1"><Bell className="w-3.5 h-3.5 text-emerald-400" /> GA notification only</span>
              <span className="inline-flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-emerald-400" /> No spam, ever</span>
            </div>
          </div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-gray-200/70 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 grid md:grid-cols-4 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-950 to-gray-700 text-white flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold tracking-tight">Deploy Doctor</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.18em]">for Vercel</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-500 leading-relaxed">
              The deploy-quality preflight every Vercel launch deserves.
              Built by indie hackers, for indie hackers.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Product</p>
            <ul className="mt-4 space-y-2.5 text-gray-700">
              <li><a href="#how" className="hover:text-gray-950">How It Works</a></li>
              <li><a href="#features" className="hover:text-gray-950">Checks & Rules</a></li>
              <li><a href="#pricing" className="hover:text-gray-950">Pricing</a></li>
              <li><Link href="/register" className="hover:text-gray-950">Join Waitlist</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Company</p>
            <ul className="mt-4 space-y-2.5 text-gray-700">
              <li><Link href="/about" className="hover:text-gray-950">About</Link></li>
              <li><Link href="/changelog" className="hover:text-gray-950">Changelog</Link></li>
              <li><a href="mailto:founders@deploydoctor.dev" className="hover:text-gray-950">Contact</a></li>
              <li><Link href="/blog" className="hover:text-gray-950">Blog</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Legal</p>
            <ul className="mt-4 space-y-2.5 text-gray-700">
              <li><Link href="/privacy" className="hover:text-gray-950">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-gray-950">Terms</Link></li>
              <li><Link href="/security" className="hover:text-gray-950">Security</Link></li>
              <li><Link href="/status" className="hover:text-gray-950">Status</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200/70">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-gray-500">
            <p>© {new Date().getFullYear()} Deploy Doctor · Not affiliated with Vercel, Inc.</p>
            <p className="flex items-center gap-1">Built with <span className="text-rose-500">♥</span> for people that ship</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
