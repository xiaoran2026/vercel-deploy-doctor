/**
 * Vercel Deploy Doctor - Check Engine (MVP skeleton)
 *
 * Architecture:
 *  - Each "rule" is a stateless async function taking a CheckContext
 *    and returning an array of Findings.
 *  - Rules are grouped by FindingCategory.
 *  - MVP: 12 representative rules (real HTTP fetching + meta parsing +
 *    well-known heuristics).  Real Lighthouse / bundle-size analysis would
 *    run later in a worker; for MVP we return consistent heuristics.
 */

import type { FindingCategory, Severity } from "@/lib/types";

export type FindingDraft = {
  category: FindingCategory;
  severity: Severity;
  title: string;
  description?: string | null;
  recommendation?: string | null;
  ruleId: string;
  impact?: "High" | "Medium" | "Low" | null;
  docsUrl?: string | null;
  meta?: Record<string, unknown>;
};

export type CheckContext = {
  targetUrl: string;
  normalizedUrl: string;   // https:// prefixed
  hostname: string;
  // HTTP fetch artifacts
  response?: {
    status: number;
    headers: Record<string, string>;
    body: string;           // truncated HTML (< 500 KB)
    contentType: string;
  };
  options: {
    includeLighthouse: boolean;
    includeSecurity: boolean;
    includePerformance: boolean;
    includeConfig: boolean;
  };
};

export type EngineResult = {
  findings: FindingDraft[];
  // Scoring (0-100) per category
  scores: {
    deployHealth: number;
    performance: number | null;
    accessibility: number | null;
    seo: number | null;
    security: number | null;
  };
  overall: number;
  summary: {
    issuesCount: number;
    warningsCount: number;
    passedCount: number;
    topIssues: string[];
  };
  lighthouseData?: Record<string, unknown> | null;
  deployChecks?: Record<string, unknown> | null;
};

type Rule = (ctx: CheckContext) => Promise<FindingDraft[]> | FindingDraft[];

// ----------------- helpers -----------------

const hasHeader = (h: Record<string, string>, name: string) =>
  Object.keys(h).some((k) => k.toLowerCase() === name.toLowerCase());
const getHeader = (h: Record<string, string>, name: string) => {
  const key = Object.keys(h).find((k) => k.toLowerCase() === name.toLowerCase());
  return key ? h[key] : undefined;
};

const SEC_HEADERS = [
  { id: "sec-csp",       name: "Content-Security-Policy",          docs: "https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP" },
  { id: "sec-hsts",      name: "Strict-Transport-Security",        docs: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security" },
  { id: "sec-xframe",    name: "X-Frame-Options",                  docs: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options" },
  { id: "sec-contenttype",name: "X-Content-Type-Options",          docs: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options" },
  { id: "sec-referrer",  name: "Referrer-Policy",                  docs: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy" },
  { id: "sec-permissions",name: "Permissions-Policy",              docs: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy" },
];

// ----------------- Rule: Security headers -----------------
const ruleSecurityHeaders: Rule = (ctx) => {
  if (!ctx.options.includeSecurity || !ctx.response) return [];
  const out: FindingDraft[] = [];
  const h = ctx.response.headers;

  // Check each required security header
  const missingCritical = SEC_HEADERS.slice(0, 3);
  const missingWarn     = SEC_HEADERS.slice(3);

  for (const s of missingCritical) {
    if (!hasHeader(h, s.name)) {
      out.push({
        category: "SECURITY",
        severity: "CRITICAL",
        ruleId: s.id,
        title: `Missing ${s.name} header`,
        description: `Your deploy does not send the ${s.name} response header. This is a well-known attack vector (XSS, clickjacking, MITM).`,
        recommendation: `Add to vercel.json → headers[] → key: "${s.name}", value: "(recommended value)". See ${s.docs}.`,
        impact: "High",
        docsUrl: s.docs,
      });
    }
  }
  for (const s of missingWarn) {
    if (!hasHeader(h, s.name)) {
      out.push({
        category: "SECURITY",
        severity: "WARNING",
        ruleId: s.id,
        title: `Missing ${s.name} header`,
        description: `${s.name} is recommended for defense-in-depth.`,
        recommendation: `Add "${s.name}" to vercel.json response headers.`,
        impact: "Medium",
        docsUrl: s.docs,
      });
    }
  }

  // Server header info leak
  const server = getHeader(h, "server") || "";
  if (/vercel/i.test(server)) {
    out.push({
      category: "SECURITY",
      severity: "INFO",
      ruleId: "sec-server-vercel",
      title: "Server header reveals Vercel stack",
      description: `Server: ${server} — fine, but removes a small information-disclosure surface if blanked.`,
      recommendation: `Optional: in vercel.json set "Server" header to empty.`,
      impact: "Low",
    });
  }

  // X-Powered-By
  if (hasHeader(h, "x-powered-by")) {
    out.push({
      category: "SECURITY",
      severity: "WARNING",
      ruleId: "sec-xpoweredby",
      title: "X-Powered-By header leaks stack info",
      description: `X-Powered-By is set (${getHeader(h, "x-powered-by") ?? ""}). Remove for defense-in-depth.`,
      recommendation: `Add poweredByHeader: false to next.config.js, or use vercel.json to drop the header.`,
      impact: "Low",
      docsUrl: "https://nextjs.org/docs/app/api-reference/next-config-js/poweredByHeader",
    });
  }
  return out;
};

// ----------------- Rule: Caching / Cache-Control -----------------
const ruleCaching: Rule = (ctx) => {
  if (!ctx.options.includePerformance || !ctx.response) return [];
  const out: FindingDraft[] = [];
  const cc = getHeader(ctx.response.headers, "cache-control");

  if (!cc) {
    out.push({
      category: "PERFORMANCE",
      severity: "WARNING",
      ruleId: "perf-no-cachecontrol",
      title: "Missing Cache-Control response header",
      description: "Root page returned without cache-control. Users may re-fetch from origin unnecessarily.",
      recommendation: `For SSG pages, add vercel.json or Next.js headers: Cache-Control: public, max-age=0, must-revalidate, s-maxage=31536000 (stale-while-revalidate).`,
      impact: "Medium",
      docsUrl: "https://vercel.com/docs/concepts/edge-network/caching",
    });
  } else if (!/immutable|s-maxage|max-age=\d+/.test(cc)) {
    out.push({
      category: "PERFORMANCE",
      severity: "INFO",
      ruleId: "perf-cachecontrol-weak",
      title: "Cache-Control is permissive",
      description: `Current value: "${cc}". Static assets should usually include 'immutable' or large s-maxage.`,
      recommendation: `Ensure /_next/static/* has: public, max-age=31536000, immutable in vercel.json.`,
      impact: "Medium",
    });
  }
  // ETAG / Last-Modified
  if (!hasHeader(ctx.response.headers, "etag") && !hasHeader(ctx.response.headers, "last-modified")) {
    out.push({
      category: "PERFORMANCE",
      severity: "INFO",
      ruleId: "perf-no-etag",
      title: "Neither ETag nor Last-Modified is returned",
      description: "Without validators, 304 Not Modified responses can't be issued; conditional requests miss.",
      impact: "Low",
    });
  }
  // Vercel cache status
  const xvc = getHeader(ctx.response.headers, "x-vercel-cache");
  if (xvc && /MISS/i.test(xvc)) {
    out.push({
      category: "PERFORMANCE",
      severity: "INFO",
      ruleId: "perf-xvercelcache-miss",
      title: "X-Vercel-Cache was MISS on this probe",
      description: "This check's hit was a cache miss (expected for first request in region). Monitor across runs.",
      impact: "Low",
    });
  }
  return out;
};

// ----------------- Rule: SEO / Meta / OG -----------------
const ruleSeoMeta: Rule = (ctx) => {
  if (!ctx.response) return [];
  const out: FindingDraft[] = [];
  const html = ctx.response.body;
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  const desc  = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1];
  const ogImg = html.match(/<meta\s+(property|name)=["']og:image["']\s+content=["']([^"']+)["']/i)?.[2] ??
                html.match(/<meta\s+content=["']([^"']+)["']\s+(property|name)=["']og:image["']/i)?.[1];
  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1] ??
                    html.match(/<link\s+href=["']([^"']+)["']\s+rel=["']canonical["']/i)?.[1];

  if (!title || title.length < 10) {
    out.push({
      category: "SEO",
      severity: "WARNING",
      ruleId: "seo-title",
      title: "Missing or short <title>",
      description: title ? `Title is only ${title.length} chars.` : "No <title> tag found.",
      recommendation: "Add a descriptive title 30–60 chars, including your brand and keyword.",
      impact: "High",
    });
  }
  if (!desc) {
    out.push({
      category: "SEO",
      severity: "WARNING",
      ruleId: "seo-meta-description",
      title: "Missing meta description",
      description: "SERP snippets default to whatever Google scrapes.",
      recommendation: "Add a 120–160 char description meta tag.",
      impact: "Medium",
    });
  }
  if (!ogImg) {
    out.push({
      category: "SEO",
      severity: "WARNING",
      ruleId: "seo-ogimage",
      title: "og:image is not set",
      description: "Social shares on Twitter / LinkedIn / X will render a blank preview. CTR loss up to 30%.",
      recommendation: "Add og:image (1200×630), plus og:image:width and og:image:height.",
      impact: "High",
    });
  }
  if (!canonical) {
    out.push({
      category: "SEO",
      severity: "INFO",
      ruleId: "seo-canonical",
      title: "Missing rel=canonical link",
      description: "Without canonical, same content reachable on multiple URLs splits link equity.",
      impact: "Medium",
    });
  }

  // Robots
  const robots = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i)?.[1];
  if (robots && /noindex/i.test(robots)) {
    out.push({
      category: "SEO",
      severity: "CRITICAL",
      ruleId: "seo-noindex",
      title: "Meta robots contains noindex",
      description: "This page is actively blocked from indexing. Check environment variables / layout constants.",
      recommendation: "Remove noindex in production robots meta tag.",
      impact: "High",
    });
  }
  return out;
};

// ----------------- Rule: Deploy config / vercel.json heuristics -----------------
const ruleDeployConfig: Rule = (ctx) => {
  if (!ctx.options.includeConfig) return [];
  const out: FindingDraft[] = [];
  // MVP heuristics: check well-known vercel edge behaviour endpoints + common Next.js leaks
  const hostname = ctx.hostname;

  // 1) Custom domain without www redirect heuristic — if root page has no rel=canonical hint for www, that's OK but suggest www->non-www
  if (/^www\./.test(hostname) === false) {
    // don't flag, just informational — here we put best-practice for redirect
    out.push({
      category: "DEPLOY",
      severity: "INFO",
      ruleId: "deploy-www-redirect",
      title: "Verify www / apex domain redirect",
      description: "Ensure both www and apex domains point to Vercel and one 301 redirects to the other.",
      recommendation: "In Project → Domains, set one as primary; the other will redirect automatically on Vercel.",
      impact: "Low",
      docsUrl: "https://vercel.com/docs/concepts/projects/custom-domains",
    });
  }

  // 2) Suggest ISR / incremental adoption for Next.js apps
  out.push({
    category: "DEPLOY",
    severity: "INFO",
    ruleId: "deploy-verceljson-audit",
    title: "Suggested vercel.json hygiene",
    description: "Pin Node version with engines.node, set functions regions, and review Function maxDuration against your real p95.",
    recommendation: `Example: { "functions": { "api/**/*.ts": { "maxDuration": 30, "regions": ["iad1"] } } }`,
    docsUrl: "https://vercel.com/docs/projects/project-configuration",
  });

  // 3) Vercel preview / production env: mention pre-deploy checks
  out.push({
    category: "DEPLOY",
    severity: "INFO",
    ruleId: "deploy-preview-checks",
    title: "Add Deploy Doctor to your Vercel Checks",
    description: "Block merging PRs where overall score drops below team threshold.",
    recommendation: "Growth plan exposes a REST endpoint you can wire into GitHub Checks / Vercel Checks.",
    impact: "Medium",
  });

  // 4) Security headers via vercel.json — reminder
  out.push({
    category: "DEPLOY",
    severity: "WARNING",
    ruleId: "deploy-sec-headers-verceljson",
    title: "Prefer centralizing security headers in vercel.json",
    description: "Route-level headers inside app route renderers can be inconsistent. vercel.json is the single source of truth.",
    recommendation: `Put CSP/HSTS and co under "headers": [{ "source": "/(.*)", "headers": [...] }] in vercel.json.`,
    docsUrl: "https://vercel.com/docs/projects/project-configuration#headers",
  });

  return out;
};

// ----------------- Rule: Accessibility (HTML heuristics) -----------------
const ruleA11y: Rule = (ctx) => {
  if (!ctx.response) return [];
  const out: FindingDraft[] = [];
  const html = ctx.response.body;
  const hasLang = /<html\s[^>]*lang=/.test(html);
  if (!hasLang) {
    out.push({
      category: "ACCESSIBILITY", severity: "WARNING", ruleId: "a11y-html-lang",
      title: "<html> is missing a lang attribute",
      description: "Screen readers default to wrong pronunciation.",
      recommendation: `<html lang="en"> (or your language).`,
      impact: "Medium",
    });
  }
  // Alt text heuristic — crude count of <img without alt
  const imgs = html.match(/<img\b[^>]*>/gi) ?? [];
  const noAlt = imgs.filter((t) => !/\balt=/.test(t)).length;
  if (imgs.length > 0 && noAlt / imgs.length > 0.3) {
    out.push({
      category: "ACCESSIBILITY", severity: "WARNING", ruleId: "a11y-img-alt",
      title: `${noAlt}/${imgs.length} images lack alt attribute`,
      description: "Decorative images should have alt=\"\", content images need descriptive alt.",
      impact: "High",
    });
  }
  // H1 count
  const h1s = html.match(/<h1\b/gi)?.length ?? 0;
  if (h1s === 0) {
    out.push({
      category: "ACCESSIBILITY", severity: "WARNING", ruleId: "a11y-no-h1",
      title: "No <h1> tag found",
      description: "Document outline breaks for screen readers.",
      recommendation: "Add exactly one top-level <h1> per page.",
      impact: "Medium",
    });
  } else if (h1s > 1) {
    out.push({
      category: "ACCESSIBILITY", severity: "INFO", ruleId: "a11y-multi-h1",
      title: `Multiple <h1> tags (${h1s})`,
      description: "Best practice is one H1 per page.",
      impact: "Low",
    });
  }
  return out;
};

// ----------------- Rule: Performance (HTML heuristics - MVP synthetic) -----------------
const rulePerfHeuristic: Rule = (ctx) => {
  if (!ctx.response) return [];
  const out: FindingDraft[] = [];
  const html = ctx.response.body;
  // 1) Inline scripts without defer/async
  const scripts = html.match(/<script\b[^>]*>/gi) ?? [];
  const blocking = scripts.filter((s) =>
    /<script\b/i.test(s) &&
    !/\b(src|type=["']module["']|defer|async)/i.test(s) &&
    !/<script\s*>/i.test(s.replace(/\s+/g, ""))
  ).length;
  if (blocking > 1) {
    out.push({
      category: "PERFORMANCE", severity: "WARNING", ruleId: "perf-blocking-script",
      title: `${blocking} inline <script> tags may block rendering`,
      description: "Prefer defer/async or moving to bottom of <body>.",
      impact: "Medium",
    });
  }
  // 2) Unused huge CSS class hints (Tailwind usually OK, but if we see >200 style tags, note it)
  const styleTags = html.match(/<style\b/gi)?.length ?? 0;
  if (styleTags > 50) {
    out.push({
      category: "PERFORMANCE", severity: "INFO", ruleId: "perf-many-styles",
      title: `${styleTags} inline <style> tags`,
      description: "Heavy inline styles can bloat HTML. Consider external CSS + caching.",
      impact: "Low",
    });
  }
  // 3) Content length proxy
  const kb = Math.round(Buffer.byteLength(html, "utf-8") / 1024);
  if (kb > 300) {
    out.push({
      category: "PERFORMANCE", severity: "WARNING", ruleId: "perf-html-large",
      title: `HTML document is ${kb} KB (large)`,
      description: "Large HTML delays First Paint. Defer non-critical markup.",
      impact: "Medium",
    });
  }
  return out;
};

// ----------------- HTTP fetch -----------------
export async function probeUrl(rawUrl: string) {
  const url = normalizeUrl(rawUrl);
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 10_000);
  try {
    const resp = await fetch(url, {
      method: "GET",
      headers: {
        "user-agent": "DeployDoctor/1.0 (+https://deploy.doctor/bot)",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.7",
      },
      redirect: "follow",
      signal: controller.signal,
    });
    const arr = new Uint8Array(await resp.arrayBuffer());
    const maxBytes = 500 * 1024;
    const slice = arr.slice(0, maxBytes);
    const text = new TextDecoder("utf-8", { fatal: false }).decode(slice);
    const headers: Record<string, string> = {};
    resp.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });
    return {
      status: resp.status,
      headers,
      body: text,
      contentType: headers["content-type"]?.split(";")[0] ?? "text/html",
    };
  } finally {
    clearTimeout(t);
  }
}

export function normalizeUrl(raw: string): string {
  let u = raw.trim();
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  return u;
}

// ----------------- Score aggregator -----------------
function computeScores(findings: FindingDraft[], options: CheckContext["options"]): EngineResult["scores"] {
  const by = (cat: FindingCategory) => findings.filter((f) => f.category === cat);
  const weight = (s: Severity) => s === "CRITICAL" ? 10 : s === "WARNING" ? 4 : s === "INFO" ? 1 : 0;

  const compute = (cat: FindingCategory, max: number) => {
    const rows = by(cat);
    const penalty = rows.reduce((acc, r) => acc + weight(r.severity), 0);
    const raw = Math.max(0, 100 - Math.round((penalty / Math.max(max, penalty + 10)) * 70));
    return Math.max(0, Math.min(100, raw));
  };

  return {
    deployHealth:   options.includeConfig      ? compute("DEPLOY", 18)          : 85,
    performance:    options.includePerformance ? compute("PERFORMANCE", 24)     : null,
    accessibility:  options.includeLighthouse  ? compute("ACCESSIBILITY", 20)   : null,
    seo:            options.includeLighthouse  ? compute("SEO", 22)             : null,
    security:       options.includeSecurity    ? compute("SECURITY", 26)        : null,
  };
}

const RULES: Rule[] = [
  ruleSecurityHeaders,
  ruleCaching,
  ruleSeoMeta,
  ruleDeployConfig,
  ruleA11y,
  rulePerfHeuristic,
];

// ----------------- Entry point -----------------
export async function runCheckEngine(rawUrl: string, opts: CheckContext["options"]): Promise<EngineResult> {
  const normalized = normalizeUrl(rawUrl);
  const hostname = (() => {
    try { return new URL(normalized).hostname; } catch { return rawUrl; }
  })();

  let response: CheckContext["response"] | undefined;
  try {
    response = await probeUrl(normalized);
  } catch (e) {
    // Still continue — we'll report probe failure as a finding
  }

  const ctx: CheckContext = {
    targetUrl: rawUrl,
    normalizedUrl: normalized,
    hostname,
    response,
    options: opts,
  };

  const findings: FindingDraft[] = [];

  if (!ctx.response) {
    findings.push({
      category: "DEPLOY", severity: "CRITICAL", ruleId: "deploy-unreachable",
      title: "Target URL is not reachable (10s timeout)",
      description: "Deploy Doctor's probe could not reach this URL from IAD. If your app is behind IP allow-list, open to public or add our outbound IPs.",
      impact: "High",
    });
  } else if (ctx.response.status >= 400) {
    findings.push({
      category: "DEPLOY", severity: "CRITICAL", ruleId: "deploy-http-err",
      title: `Target returned HTTP ${ctx.response.status}`,
      description: "Home page responded with an error status. This is a deploy-blocking regressions if it's production.",
      impact: "High",
    });
  }

  for (const rule of RULES) {
    try {
      findings.push(...(await rule(ctx)));
    } catch (e) {
      findings.push({
        category: "CONFIG", severity: "INFO", ruleId: "engine-rule-exception",
        title: `Rule aborted: ${rule.name}`,
        description: e instanceof Error ? e.message : "Unknown",
      });
    }
  }

  // Passed count (synthetic)
  const checked = 40;
  const issuesCount = findings.filter((f) => f.severity === "CRITICAL").length;
  const warningsCount = findings.filter((f) => f.severity === "WARNING").length;
  const infoCount = findings.filter((f) => f.severity === "INFO").length;
  const passedCount = Math.max(0, checked - issuesCount - warningsCount - infoCount);

  const scores = computeScores(findings, opts);
  const overall = weightedOverall(scores);
  const topIssues = findings
    .filter((f) => f.severity === "CRITICAL" || f.severity === "WARNING")
    .slice(0, 5)
    .map((f) => f.title);

  return {
    findings,
    scores,
    overall,
    summary: { issuesCount, warningsCount, passedCount, topIssues },
    lighthouseData: null,
    deployChecks: {
      targetHostname: hostname,
      httpStatus: ctx.response?.status ?? null,
      contentType: ctx.response?.contentType ?? null,
      checkedCount: checked,
    },
  };
}

export function weightedOverall(s: EngineResult["scores"]): number {
  const parts: number[] = [];
  const weights: number[] = [];
  const add = (v: number | null | undefined, w: number) => {
    if (typeof v === "number") { parts.push(v); weights.push(w); }
  };
  add(s.deployHealth, 4);
  add(s.security, 3);
  add(s.performance, 3);
  add(s.accessibility, 2);
  add(s.seo, 2);
  if (parts.length === 0) return 70;
  const total = weights.reduce((a, b) => a + b, 0);
  const num = parts.reduce((a, p, i) => a + p * weights[i], 0);
  return Math.round(num / total);
}
