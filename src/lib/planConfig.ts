// Single source of truth for Vercel Deploy Doctor plan configuration

export type PlanId = "FREE" | "STARTER" | "GROWTH" | "AGENCY";

export interface PlanFeatureConfig {
  id: PlanId;
  name: string;
  price: number;
  period: string;
  description: string;
  maxChecksPerMonth: number | null; // null = unlimited
  maxReportsPerMonth: number | null;
  includeLighthouse: boolean;
  includeSecurity: boolean;
  includePerformance: boolean;
  includeConfig: boolean;
  aiFixSuggestions: boolean;
  scheduledChecks: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
  whiteLabel: boolean;
  features: string[];
  limits?: string[];
  popular?: boolean;
  badge?: string;
}

// Plan hierarchy: higher number = better plan
export const PLAN_HIERARCHY: Record<PlanId, number> = {
  FREE: 0,
  STARTER: 1,
  GROWTH: 2,
  AGENCY: 3,
};

export function planMeetsRequirement(currentPlan: PlanId, requiredPlan: PlanId): boolean {
  return PLAN_HIERARCHY[currentPlan] >= PLAN_HIERARCHY[requiredPlan];
}

export const PLANS: PlanFeatureConfig[] = [
  {
    id: "FREE",
    name: "Free",
    price: 0,
    period: "",
    description: "For indie hackers validating their latest deploy",
    maxChecksPerMonth: 3,
    maxReportsPerMonth: 3,
    includeLighthouse: true,
    includeSecurity: true,
    includePerformance: true,
    includeConfig: true,
    aiFixSuggestions: false,
    scheduledChecks: false,
    apiAccess: false,
    prioritySupport: false,
    whiteLabel: false,
    features: [
      "3 deploy checks / month",
      "Deploy health score",
      "Lighthouse (Performance / A11y / SEO)",
      "Security header scan",
      "vercel.json best-practice audit",
      "Basic finding details",
    ],
    limits: [
      "No AI fix suggestions",
      "No scheduled checks",
      "No historical trend",
    ],
  },
  {
    id: "STARTER",
    name: "Starter",
    price: 19,
    period: "/month",
    description: "For solo founders shipping side projects",
    maxChecksPerMonth: 50,
    maxReportsPerMonth: 50,
    includeLighthouse: true,
    includeSecurity: true,
    includePerformance: true,
    includeConfig: true,
    aiFixSuggestions: true,
    scheduledChecks: false,
    apiAccess: false,
    prioritySupport: false,
    whiteLabel: false,
    features: [
      "50 deploy checks / month",
      "Everything in Free",
      "AI-generated fix recipes with code snippets",
      "Deploy trend history (last 30 days)",
      "Shareable public report links",
      "Export report as Markdown",
    ],
  },
  {
    id: "GROWTH",
    name: "Growth",
    price: 49,
    period: "/month",
    description: "For product teams running paid traffic",
    maxChecksPerMonth: null,
    maxReportsPerMonth: null,
    includeLighthouse: true,
    includeSecurity: true,
    includePerformance: true,
    includeConfig: true,
    aiFixSuggestions: true,
    scheduledChecks: true,
    apiAccess: true,
    prioritySupport: false,
    whiteLabel: false,
    features: [
      "Unlimited deploy checks",
      "Everything in Starter",
      "Scheduled daily/weekly checks",
      "Slack / email alerts on regressions",
      "Unlimited trend & comparison history",
      "API access for CI/CD integration",
      "PDF export with brand colors",
    ],
    popular: true,
    badge: "Most Popular",
  },
  {
    id: "AGENCY",
    name: "Agency",
    price: 149,
    period: "/month",
    description: "For agencies delivering deploy quality to clients",
    maxChecksPerMonth: null,
    maxReportsPerMonth: null,
    includeLighthouse: true,
    includeSecurity: true,
    includePerformance: true,
    includeConfig: true,
    aiFixSuggestions: true,
    scheduledChecks: true,
    apiAccess: true,
    prioritySupport: true,
    whiteLabel: true,
    features: [
      "Everything in Growth",
      "White-label reports (your logo)",
      "Multi-project workspaces",
      "Client shareable dashboard",
      "Priority support (SLA 24h)",
      "SSO & team roles (coming soon)",
      "Custom check recipes (coming soon)",
    ],
    badge: "For Agencies",
  },
];
