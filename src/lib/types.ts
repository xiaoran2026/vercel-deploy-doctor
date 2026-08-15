export type EntityId = string | number;

export interface User {
  id: EntityId;
  email: string;
  name?: string;
  plan?: string;
  role?: string;
  createdAt?: string;
}

// ===== Vercel Deploy Doctor =====

export type CheckStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
export type ReportStatus = "GENERATING" | "COMPLETED" | "FAILED";
export type FindingCategory = "DEPLOY" | "PERFORMANCE" | "ACCESSIBILITY" | "SEO" | "SECURITY" | "CONFIG";
export type Severity = "CRITICAL" | "WARNING" | "INFO" | "PASS";

export interface Check {
  id: EntityId;
  targetUrl: string;
  status: CheckStatus;
  progress: number;
  currentStep?: string | null;
  errorMessage?: string | null;
  includeLighthouse: boolean;
  includeSecurity: boolean;
  includePerformance: boolean;
  includeConfig: boolean;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

export interface Finding {
  id: EntityId;
  category: FindingCategory;
  severity: Severity;
  title: string;
  description?: string | null;
  recommendation?: string | null;
  ruleId?: string | null;
  impact?: string | null;
  docsUrl?: string | null;
}

export interface DeployReport {
  id: EntityId;
  checkId: EntityId;
  targetUrl: string;
  overallScore: number;
  deployHealth: number;
  performanceScore?: number | null;
  accessibilityScore?: number | null;
  seoScore?: number | null;
  securityScore?: number | null;
  summary?: {
    issuesCount: number;
    warningsCount: number;
    passedCount: number;
    topIssues: string[];
  } | null;
  status: ReportStatus;
  findings: Finding[];
  createdAt: string;
  completedAt?: string | null;
}

export interface ReportListItem {
  id: EntityId;
  checkId: EntityId;
  targetUrl: string;
  overallScore: number;
  deployHealth: number;
  performanceScore?: number | null;
  accessibilityScore?: number | null;
  seoScore?: number | null;
  securityScore?: number | null;
  status: ReportStatus;
  issuesCount?: number;
  warningsCount?: number;
  createdAt: string;
  // Legacy Store Leak fields (stubs used by api.ts mapReportListItem; unused in Deploy Doctor)
  reportId?: EntityId;
  taskId?: EntityId | null;
  storeId?: EntityId | null;
  storeName?: string | null;
  reportDate?: string;
  uploadedAt?: string;
  totalOpportunity?: number;
  revenueRecovered?: number;
  healthScore?: number;
  [key: string]: any;
}

export interface CreateCheckRequest {
  targetUrl: string;
  includeLighthouse?: boolean;
  includeSecurity?: boolean;
  includePerformance?: boolean;
  includeConfig?: boolean;
}

export interface TaskStatus {
  checkId: EntityId;
  status: CheckStatus;
  progress: number;
  currentStep?: string | null;
  reportId?: EntityId | null;
  errorMessage?: string | null;
  createdAt: string;
}

// ===== Generic =====

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface Subscription {
  id: EntityId;
  plan: string;
  status: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  checksUsedThisMonth: number;
  lastResetAt?: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: EntityId;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  paidAt?: string;
  createdAt: string;
}

export interface BillingData {
  subscription: Subscription | null;
  paymentHistory: PaymentRecord[];
  currentPlan: string;
  canUpgrade: boolean;
  canCancel: boolean;
}

export interface UsageSummary {
  plan: string;
  planDisplay: string;
  monthlyPrice: number;
  maxChecksPerMonth: number | null;
  maxReportsPerMonth: number | null;
  checksUsedThisMonth: number;
  checksRemaining: number | null;
  checkUsagePct: number;
  canRunCheck: boolean;
  // Legacy Store Leak fields (stubs for retained profile UI; always 0 / null in Deploy Doctor)
  reportsUsedThisMonth?: number;
  reportsRemaining?: number | null;
  storeCount?: number;
  remainingStoreSlots?: number;
  maxStores?: number | null;
  uploadCount?: number;
  remainingUploads?: number;
  [key: string]: any;
}

// ===== Admin =====

export interface AdminDashboardStats {
  totalUsers: number;
  totalChecks: number;
  totalReports: number;
  totalRevenue: number;
  todayChecks: number;
  todayPayments: number;
  todayNewUsers: number;
  totalSubscriptions: number;
  avgDeployHealth: number;
}

export interface AdminPageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// ===== Legacy / placeholder types (from Store Leak era) =====
// These are referenced by api.ts and preserved pages. They have no runtime meaning
// in Vercel Deploy Doctor and exist only to keep TypeScript checks green until the
// relevant modules are fully rewritten.

export interface ReportData {
  id?: EntityId;
  [key: string]: any;
}

export interface UploadResponse {
  id?: EntityId;
  fileId?: EntityId;
  fileName?: string;
  rows?: number;
  status?: string;
  storeId?: EntityId;
  taskId?: EntityId;
  [key: string]: any;
}

export interface AdminUser {
  id: EntityId;
  email: string;
  [key: string]: any;
}

export interface AdminStore {
  id: EntityId;
  userId: EntityId;
  name: string;
  [key: string]: any;
}

export interface AdminReport {
  id: EntityId;
  userId: EntityId;
  [key: string]: any;
}

export interface AdminPayment {
  id: EntityId;
  userId: EntityId;
  amount: number;
  status: string;
  [key: string]: any;
}

export interface AdminLog {
  id: EntityId;
  level: string;
  message: string;
  createdAt: string;
  [key: string]: any;
}

export interface AdminSystemSettings {
  [key: string]: any;
}

export interface AdminHealthCheck {
  status: string;
  [key: string]: any;
}

export interface AdminDeploymentInfo {
  env: string;
  [key: string]: any;
}

export interface AdminRecentLogs {
  logs: AdminLog[];
}
