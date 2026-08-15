"use client";

import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, Database, Server, Trash2, Mail } from "lucide-react";

const sections = [
  {
    Icon: Eye,
    title: "What we scan",
    body: "When you submit a URL, Deploy Doctor performs a non-intrusive HTTP audit of the publicly accessible endpoint. We fetch the page response, headers, status codes, redirect chains, caching directives, security headers, and publicly linked assets to generate a deploy analysis report. We do not crawl behind authentication, submit forms, or attempt any form of vulnerability probing beyond reading public HTTP responses.",
  },
  {
    Icon: Database,
    title: "What we store",
    body: "We store the account information you use to sign up (email, encrypted password hash), the URLs you request to scan, the generated report scores and findings, and the timestamp of each scan. Raw HTTP response bodies are discarded after the rule engine runs; we do not retain full page HTML snapshots long-term. If you enable premium Lighthouse audits, Lighthouse JSON snapshots may be retained for up to 30 days for report rendering.",
  },
  {
    Icon: Lock,
    title: "What we never do",
    body: "Deploy Doctor never reads or accesses your source code, environment variables, build logs, Vercel account, or server-side execution. The scanner operates from the outside like any visitor on the public internet. We never sell, share, or rent account data or scan history with third parties. We do not run ad network tracking scripts against scanned URLs on your behalf.",
  },
  {
    Icon: Server,
    title: "Subprocessors & hosting",
    body: "The application runs on Vercel serverless infrastructure. Relational data is stored in a managed PostgreSQL database hosted by Neon. Outbound HTTP probes originate from Vercel's AWS us-east-1 region. Emails are delivered via Resend. Payment processing (when enabled) is handled by Stripe — we never see or store full card numbers on our systems.",
  },
  {
    Icon: Trash2,
    title: "Data retention & deletion",
    body: "Free-tier scan reports are retained for 90 days. Paid plans retain reports for 12 months. You can delete individual reports from your dashboard at any time. To request full account deletion, email privacy@store-leak.com from the address associated with your account — we will fulfill verified requests within 14 days and send you a confirmation when complete.",
  },
  {
    Icon: Shield,
    title: "Security measures",
    body: "All traffic is served over TLS 1.2+. Passwords are hashed with Argon2id. Authentication tokens are signed with HMAC-SHA-256 and rotated on logout. Database connections enforce TLS. Production systems run under least-privilege IAM roles. We do not log raw request bodies that may contain sensitive information.",
  },
  {
    Icon: Mail,
    title: "Contact & updates",
    body: "For privacy questions, deletion requests, or data export inquiries, email privacy@store-leak.com. We may update this policy as the product evolves; material changes will be flagged in-product and via the email on file. This policy was last updated in August 2026.",
  },
];

export default function PrivacyPage() {
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
            Privacy
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-gray-950">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm sm:text-base leading-7 text-gray-600 max-w-2xl">
            Deploy Doctor is built to be boring and transparent with your data.
            We scan public deploy endpoints from the outside, keep the minimum
            data required to render reports, and delete the rest.
          </p>

          <div className="mt-8 grid gap-3 sm:gap-4">
            {sections.map(({ Icon, title, body }) => (
              <section
                key={title}
                className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/60 p-5 sm:p-6"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
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

          <div className="mt-8 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-violet-50/40 p-5 sm:p-6">
            <p className="text-sm font-semibold text-gray-950">
              Short version (TL;DR)
            </p>
            <p className="mt-2 text-sm leading-7 text-gray-700">
              We're a scanner, not a store. We never touch your source code or
              Vercel account. We never sell your data. You can delete anything,
              anytime. If something is unclear, just ask — we'd rather over-explain
              than under-deliver on trust.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex items-center justify-center h-11 px-5 rounded-xl bg-gray-950 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              Try Deploy Doctor
            </Link>
            <Link
              href="/terms"
              className="inline-flex items-center justify-center h-11 px-5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
