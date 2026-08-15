"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Compass,
  UserCheck,
  AlertTriangle,
  CreditCard,
  Ban,
  Scale,
  RefreshCw,
  MessageSquare,
  FileCheck,
  Zap,
} from "lucide-react";

const sections = [
  {
    Icon: Compass,
    title: "1. Service description",
    body: "Deploy Doctor provides an automated deploy auditing platform. You submit a publicly reachable URL, and our service runs a set of heuristic checks (HTTP probing, header analysis, configurable rule sets, and optional Lighthouse audits) and returns a scored report with observations and suggested remediations. Reports are informational tools — they do not guarantee security, compliance, or production readiness.",
  },
  {
    Icon: Zap,
    title: "2. Acceptable use",
    body: "You agree to scan only URLs you own or have explicit permission to test. You will not use the service to perform denial-of-service style scanning, to bypass rate limits by opening multiple accounts, to scan domains you do not control at scale, or to harvest information for competitive targeting or spam. We rate-limit scans per account and reserve the right to throttle or reject requests originating from abusive IP ranges or user behavior.",
  },
  {
    Icon: UserCheck,
    title: "3. Account & eligibility",
    body: "Accounts require a valid email address and password. You are responsible for maintaining account confidentiality and for all activity that occurs under your credentials. Sharing of paid accounts between unrelated entities is prohibited. You must be 16 years or older to use the service. We may refuse service, close accounts, or rescind access at our discretion if activity violates these terms.",
  },
  {
    Icon: AlertTriangle,
    title: "4. Report accuracy & disclaimers",
    body: "Scans are point-in-time snapshots based on public responses. Findings are directional — a 'Passed' result does not mean a deployment is bug-free, secure, or compliant. Reports should augment (not replace) your own QA, security review, and operational monitoring. The service is provided 'AS IS' without warranties of any kind, including merchantability, fitness for a particular purpose, or non-infringement.",
  },
  {
    Icon: CreditCard,
    title: "5. Paid subscriptions & billing",
    body: "Paid plans are billed in advance on a monthly or annual basis via Stripe. All fees are non-refundable unless explicitly required by law. Downgrades take effect at the end of the current billing period; features associated with the previous tier remain available until then. Pricing and plan limits are published on the Pricing page and may change with 30 days' notice via email.",
  },
  {
    Icon: RefreshCw,
    title: "6. Cancellations",
    body: "You may cancel your subscription at any time from the Billing page. Cancellation stops future charges and retains access until the end of the paid term. Deleting your account also cancels any active subscription immediately. We do not prorate partial months. Free-tier accounts may be paused or removed after 12 months of inactivity.",
  },
  {
    Icon: Ban,
    title: "7. Prohibited conduct",
    body: "You will not: reverse-engineer or attempt to extract the rule engine; use automated scripts to resell or re-broker scan results as a competing service; upload or introduce malware, exploits, or malicious payloads; impersonate another person or entity; or use the service to generate spam, phishing, or deceptive content.",
  },
  {
    Icon: Scale,
    title: "8. Liability",
    body: "To the fullest extent permitted by law, Deploy Doctor's total cumulative liability for any claim relating to these terms or the service shall not exceed the total fees paid by you in the 12 months preceding the claim. We are not liable for indirect, incidental, special, consequential, or punitive damages, including lost revenue, lost data, or business interruption.",
  },
  {
    Icon: FileCheck,
    title: "9. Intellectual property",
    body: "Between the parties, you retain ownership of URLs you submit and any content you provide. Deploy Doctor retains ownership of the platform, rule engines, scoring algorithms, branding, UI/UX design, trademarks, and logos. You may not copy, reproduce, or redistribute parts of the product for commercial purposes without written permission.",
  },
  {
    Icon: MessageSquare,
    title: "10. Contact & disputes",
    body: "Questions about these terms, billing disputes, or account issues should be directed to legal@store-leak.com. We aim to respond within 5 business days. These terms are governed by the laws of Singapore, without regard to conflict-of-law principles. The exclusive venue for disputes arising from these terms shall be the courts of Singapore.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 sm:p-10 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
            Terms
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-gray-950">
            Terms of Service
          </h1>
          <p className="mt-4 text-sm sm:text-base leading-7 text-gray-600 max-w-2xl">
            A straightforward contract between you and Deploy Doctor.
            No gotchas, no hidden clauses. If something below is unclear,
            just ask before you sign up.
          </p>
          <p className="mt-3 text-xs text-gray-500">
            Effective date: August 1, 2026 · Last reviewed: August 2026
          </p>

          <div className="mt-8 grid gap-3 sm:gap-4">
            {sections.map(({ Icon, title, body }) => (
              <section
                key={title}
                className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/60 p-5 sm:p-6"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-950">
                      {title}
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-gray-600">
                      {body}
                    </p>
                  </div>
                </div>
              </section>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/80 to-orange-50/40 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-950">
                  Important limitation of liability
                </p>
                <p className="mt-2 text-sm leading-7 text-gray-700">
                  Deploy Doctor is a diagnostic tool, not a certification.
                  Before making production changes based on a report,
                  always verify with your team's engineering and security
                  processes. You — and you alone — are responsible for
                  changes you make to your deployments.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/privacy"
              className="inline-flex items-center justify-center h-11 px-5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center h-11 px-5 rounded-xl bg-gray-950 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
