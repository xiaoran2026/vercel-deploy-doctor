import axios from "axios";
import type { ApiResponse, User, ReportData, ReportListItem, TaskStatus, UploadResponse, BillingData, Subscription, PaymentRecord, UsageSummary, AdminDashboardStats, AdminPageResponse, AdminUser, AdminStore, AdminReport, AdminPayment, AdminLog, AdminSystemSettings, AdminHealthCheck, AdminDeploymentInfo, AdminRecentLogs } from "./types";

const api = axios.create({
  // 在 Vercel 上走同源（app/api/* Route Handlers），不指向外部 8080。
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

function wrapSuccess<T>(data: T, message = "success"): ApiResponse<T> {
  return { code: 200, message, data };
}

function normalizeEnvelope<T = any>(payload: any): ApiResponse<T> {
  // Already wrapped with code
  if (payload && typeof payload.code === "number") return payload;
  // Wrapped with success
  if (payload && payload.success) return wrapSuccess(payload.data ?? null, payload.message || "success");
  // Error response from API (has error field)
  if (payload && payload.error) return { code: 500, message: payload.message || "Request failed", data: null as T };
  // Direct data (e.g. { user, token }) — wrap it
  return wrapSuccess(payload, "success");
}

// Request interceptor - attach auth token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    response.data = normalizeEnvelope(response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Unauthorized - clear auth and notify
      if (status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.dispatchEvent(new CustomEvent("auth:logout", { detail: { reason: "unauthorized" } }));
        }
      }

      // Server error - log as warning, components handle the actual error display
      if (status >= 500) {
        console.warn("Server error:", data);
      }
    } else if (error.request) {
      // Network error - request was made but no response received
      // Don't use console.error to avoid triggering Next.js dev error overlay
      console.warn("Network error: No response received");
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; name?: string }) =>
    api.post("/auth/register", data).then((res) => {
      const payload = res.data.data ?? {};
      const user = payload.user ?? {};
      const token = payload.token;
      // 同步保存 token/login 持久化
      if (typeof window !== "undefined" && token) {
        localStorage.setItem("token", token);
        if (user) localStorage.setItem("user", JSON.stringify(user));
      }
      res.data = wrapSuccess({
        id: user.id,
        email: user.email,
        plan: "FREE",
        createdTime: user.createdAt || user.createdTime,
        token,
        role: user.role,
      });
      return res;
    }),

  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data).then((res) => {
      const payload = res.data.data ?? {};
      const user = payload.user ?? {};
      const token = payload.token;
      if (typeof window !== "undefined" && token) {
        localStorage.setItem("token", token);
        if (user) localStorage.setItem("user", JSON.stringify(user));
      }
      res.data = wrapSuccess({
        token,
        userId: user.id,
        email: user.email,
        plan: "FREE",
        role: user.role,
      });
      return res;
    }),

  me: () =>
    api.get("/auth/me").then((res) => {
      const user = res.data.data?.user ?? res.data.data;
      if (typeof window !== "undefined" && user) localStorage.setItem("user", JSON.stringify(user));
      res.data = wrapSuccess(user);
      return res;
    }),

  logout: () =>
    api.post("/auth/logout").then((res) => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      return res;
    }),
};

// Reports API
export const reportsApi = {
  getReport: (reportId: string | number) =>
    api.get(`/reports/${reportId}`).then((res) => {
      const report = res.data.data?.report ?? res.data.data;
      res.data = wrapSuccess(mapReportDetail(report));
      return res;
    }),

  getStoreReports: (storeId: string | number) =>
    api.get("/reports", { params: { storeId } }).then((res) => {
      const reports = res.data.data?.reports ?? [];
      res.data = wrapSuccess(reports.map(mapReportListItem));
      return res;
    }),

  getReports: () =>
    api.get("/reports").then((res) => {
      const reports = res.data.data?.reports ?? [];
      res.data = wrapSuccess(reports.map(mapReportListItem));
      return res;
    }),

  deleteReport: (reportId: string | number) =>
    api.delete<ApiResponse<void>>(`/reports/${reportId}`),

  // 这些功能在新后端暂未实现；前端调用时会以 404 失败（或使用通用封装 fallback）
  toggleArchive: (reportId: string | number) =>
    Promise.resolve({ data: wrapSuccess<void>(undefined, 'archive not supported') }) as any,

  toggleFavorite: (reportId: string | number) =>
    Promise.resolve({ data: wrapSuccess<void>(undefined, 'favorite not supported') }) as any,

  batchDelete: (reportIds: number[]) =>
    Promise.all(reportIds.map((id) => api.delete<ApiResponse<void>>(`/reports/${id}`))).then(() => ({
      data: wrapSuccess<void>(undefined),
    })) as any,

  batchArchive: (reportIds: number[]) =>
    Promise.resolve({ data: wrapSuccess<void>(undefined, 'batch archive not supported') }) as any,

  batchFavorite: (reportIds: number[]) =>
    Promise.resolve({ data: wrapSuccess<void>(undefined, 'batch favorite not supported') }) as any,
};

// Tasks API
export const tasksApi = {
  getTaskStatus: (taskId: string | number) =>
    api.get(`/tasks/${taskId}`).then((res) => {
      const task = res.data.data?.task ?? res.data.data;
      const parsedResult = task?.result || {};
      res.data = wrapSuccess({
        taskId: task?.id,
        fileId: task?.upload?.id ?? null,
        fileName: task?.upload?.originalName ?? "CSV upload",
        status: mapTaskStatus(task?.status),
        progress: task?.progress ?? 0,
        reportId: parsedResult?.reportId ?? null,
        errorMessage: task?.errorMessage ?? null,
        createdTime: task?.createdAt,
      });
      return res;
    }),
};

// Upload API
export const uploadApi = {
  // 适配新后端：直接 POST /uploads（multipart/form-data，字段 file + storeId + note + skipPreview + processNow）
  uploadCsv: async (file: File, storeId: string | number, _source?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("storeId", String(storeId));
    formData.append("processNow", "true");

    const res = await api.post("/uploads", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const upload = res.data.data?.upload ?? res.data.data;
    const task = res.data.data?.task;
    return {
      ...res,
      data: wrapSuccess<UploadResponse>({
        fileId: upload?.id,
        fileName: file.name,
        status: upload?.status ?? "UPLOADED",
        storeId,
        taskId: task?.id,
      }),
    };
  },

  // 旧 /files 路径改 /uploads
  getUploadHistory: (storeId: string | number) =>
    api.get("/uploads", { params: { storeId } }).then((res) => {
      const uploads = res.data.data?.uploads ?? [];
      res.data = wrapSuccess(
        uploads.map((item: any) => ({
          fileId: item.id,
          fileName: item.originalName,
          status: item.status,
          uploadedAt: item.createdAt,
          taskStatus: mapTaskStatus(item.task?.status) ?? null,
          taskId: item.task?.id ?? null,
          reportId: item.reports?.[0]?.id ?? null,
          healthScore: item.reports?.[0]?.healthScore ?? null,
          completedAt: item.reports?.[0]?.createdAt ?? item.processedAt ?? null,
        }))
      );
      return res;
    }),
};

export interface UploadHistoryItem {
  fileId: number;
  fileName: string;
  status: string;
  uploadedAt: string;
  taskStatus: string | null;
  taskId: number | null;
  reportId: number | null;
  healthScore: number | null;
  completedAt: string | null;
}

// Store API
export const storesApi = {
  getStore: (storeId: string | number) =>
    api.get(`/stores/${storeId}`).then((res) => {
      const store = res.data.data?.store ?? res.data.data;
      res.data = wrapSuccess(store);
      return res;
    }),
};

// Dashboard API
export const dashboardApi = {
  getStores: () =>
    api.get("/stores").then(async (storesRes) => {
      const stores = storesRes.data.data?.stores ?? [];
      const reportsRes = await api.get("/reports");
      const reports = reportsRes.data.data?.reports ?? [];
      const latestByStore = new Map<string, any>();
      for (const report of reports) {
        if (!report.storeId) continue;
        const existing = latestByStore.get(report.storeId);
        if (!existing || new Date(report.createdAt).getTime() > new Date(existing.createdAt).getTime()) {
          latestByStore.set(report.storeId, report);
        }
      }

      return {
        data: wrapSuccess(
          stores.map((store: any) => {
            const latest = latestByStore.get(store.id);
            return {
              storeId: store.id,
              storeName: store.storeName || store.shopDomain,
              platform: "Shopify",
              latestHealthScore: latest?.healthScore ?? null,
              reportCount: store._count?.reports ?? 0,
              createdAt: store.createdAt,
            };
          })
        ),
      };
    }),

  getStoreDashboard: (storeId: string | number) =>
    Promise.all([api.get(`/stores/${storeId}`), api.get("/reports", { params: { storeId } }), api.get("/uploads", { params: { storeId } })]).then(
      ([storeRes, reportsRes, uploadsRes]) => {
        const store = storeRes.data.data?.store ?? {};
        const reports = reportsRes.data.data?.reports ?? [];
        const uploads = uploadsRes.data.data?.uploads ?? [];
        const latestReport = reports[0] ?? null;
        const latestUpload = uploads[0] ?? null;

        return {
          data: wrapSuccess({
            storeId: store.id,
            storeName: store.storeName || store.shopDomain,
            healthScore: latestReport?.healthScore ?? 0,
            totalRevenue: Number(latestReport?.benchmarks?.averageOrderValue?.your || 0) * Number(latestUpload?.rowCount || 0),
            totalOrders: latestUpload?.rowCount || 0,
            averageOrderValue: Number(latestReport?.benchmarks?.averageOrderValue?.your || 0),
            repeatRate: Number(latestReport?.benchmarks?.repeatPurchaseRate?.your || 0) * 100,
            topProducts: [],
            summary: latestReport?.summary || "",
            monthlyRevenueTrend: {},
            monthlyOrdersTrend: {},
            healthTrend: reports.map((report: any) => ({
              reportId: report.id,
              createdAt: report.createdAt,
              healthScore: report.healthScore,
            })),
            latestUpload: latestUpload
              ? {
                  fileName: latestUpload.originalName,
                  status: latestUpload.status,
                  createdAt: latestUpload.createdAt,
                  storeName: store.storeName || store.shopDomain,
                  totalRows: latestUpload.rowCount,
                  report: latestReport
                    ? {
                        reportId: latestReport.id,
                        healthScore: latestReport.healthScore,
                        createdAt: latestReport.createdAt,
                      }
                    : undefined,
                }
              : null,
            latestReport: latestReport
              ? {
                  reportId: latestReport.id,
                  healthScore: latestReport.healthScore,
                  createdAt: latestReport.createdAt,
                }
              : null,
          }),
        };
      }
    ),
};

function mapTaskStatus(status?: string) {
  if (status === "QUEUED") return "PENDING";
  if (status === "RUNNING") return "ANALYZING";
  return status;
}

function mapReportListItem(report: any): ReportListItem {
  return {
    id: report.id,
    checkId: "",
    targetUrl: report.store?.storeName ?? report.upload?.originalName ?? "",
    overallScore: report.healthScore ?? 0,
    deployHealth: report.healthScore ?? 0,
    performanceScore: null,
    accessibilityScore: null,
    seoScore: null,
    securityScore: null,
    status: (report.status === "COMPLETED" ? "COMPLETED" : report.status === "FAILED" ? "FAILED" : "GENERATING") as any,
    issuesCount: 0,
    warningsCount: 0,
    createdAt: report.createdAt,
    reportId: report.id,
    taskId: undefined,
    storeId: report.store?.id ?? report.storeId,
    storeName: report.store?.storeName ?? report.storeName,
    fileName: report.upload?.originalName ?? report.originalName,
    healthScore: report.healthScore ?? 0,
    summary: report.summary ?? "",
    totalRevenue: undefined,
    totalOrders: report.upload?.rowCount,
    averageOrderValue: Number(report.benchmarks?.averageOrderValue?.your || 0),
    repeatRate: Number(report.benchmarks?.repeatPurchaseRate?.your || 0) * 100,
    taskStatus: report.status,
    archived: report.archived,
    favorite: report.favorite,
  };
}

function mapReportDetail(report: any): ReportData {
  const analysis = report?.analysisSnapshot || {};
  const sales = analysis.sales || {};
  const products = analysis.products || {};
  const customers = analysis.customers || {};
  const countries = analysis.countries || {};
  const fixes = Array.isArray(report?.fixes) ? report.fixes : [];

  const recommendations = fixes.flatMap((fix: any) => {
    if (Array.isArray(fix?.actionItems) && fix.actionItems.length > 0) {
      return [String(fix.actionItems[0])];
    }
    return fix?.description ? [String(fix.description)] : fix?.title ? [String(fix.title)] : [];
  });

  const problems = fixes.map((fix: any) => String(fix?.title || fix?.description || "Revenue opportunity detected"));

  return {
    healthScore: Number(report?.healthScore || 0),
    summary: String(report?.summary || ""),
    salesInsights: [
      sales?.totalRevenue ? `Store revenue totals ${formatCurrencyNumber(sales.totalRevenue)} across ${Number(sales.totalOrders || 0)} orders.` : null,
      sales?.averageOrderValue ? `Average order value is ${formatCurrencyNumber(sales.averageOrderValue)}.` : null,
      Array.isArray(sales?.monthlyRevenue) && sales.monthlyRevenue.length > 1
        ? `Monthly revenue trend spans ${sales.monthlyRevenue.length} months of uploaded order data.`
        : null,
    ].filter(Boolean) as string[],
    productInsights: [
      products?.topProductsByRevenue?.[0]
        ? `${products.topProductsByRevenue[0].productTitle} is currently the top revenue-driving product.`
        : null,
      products?.revenueConcentration != null
        ? `Top-product concentration is ${(Number(products.revenueConcentration) * 100).toFixed(1)}% of revenue.`
        : null,
    ].filter(Boolean) as string[],
    customerInsights: [
      customers?.totalCustomers != null
        ? `${Number(customers.totalCustomers)} customers were identified in this upload.`
        : null,
      customers?.repeatPurchaseRate != null
        ? `Repeat purchase rate is ${(Number(customers.repeatPurchaseRate) * 100).toFixed(1)}%.`
        : null,
      customers?.averageLifetimeValue
        ? `Average customer lifetime value is ${formatCurrencyNumber(customers.averageLifetimeValue)}.`
        : null,
    ].filter(Boolean) as string[],
    problems,
    recommendations,
    salesAnalysis: {
      totalRevenue: Number(sales?.totalRevenue || 0),
      totalOrders: Number(sales?.totalOrders || 0),
      averageOrderValue: Number(sales?.averageOrderValue || 0),
      monthlyRevenueTrend: arrayToTrendRecord(sales?.monthlyRevenue),
      monthlyOrdersTrend: arrayToTrendRecord(sales?.monthlyOrders),
    },
    topProducts: Array.isArray(products?.topProductsByRevenue)
      ? products.topProductsByRevenue.slice(0, 10).map((item: any) => ({
          productName: item.productTitle,
          revenue: Number(item.totalRevenue || 0),
          quantity: Number(item.totalQuantity || 0),
          orderCount: Number(item.orderCount || 0),
        }))
      : [],
    customerAnalysis: {
      totalCustomers: Number(customers?.totalCustomers || 0),
      newCustomerCount: Number(customers?.newCustomers || 0),
      repeatCustomerCount: Number(customers?.returningCustomers || 0),
      repeatRate: Number(customers?.repeatPurchaseRate || 0) * 100,
    },
    countryStats: Array.isArray(countries?.topCountriesByRevenue)
      ? countries.topCountriesByRevenue.slice(0, 10).map((item: any) => ({
          country: item.country,
          orderCount: Number(item.orderCount || 0),
          revenue: Number(item.revenue || 0),
        }))
      : [],
  };
}

function arrayToTrendRecord(values: any): Record<string, number> | undefined {
  if (!Array.isArray(values) || values.length === 0) return undefined;
  return values.reduce((acc: Record<string, number>, item: any) => {
    if (item?.month) {
      acc[String(item.month)] = Number(item.value || 0);
    }
    return acc;
  }, {});
}

function formatCurrencyNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

// Types
export interface Store {
  id: number;
  storeName: string;
  platform: string;
  createdAt: string;
}

export interface DashboardStoreItem {
  storeId: number;
  storeName: string;
  platform: string;
  latestHealthScore: number | null;
  reportCount: number;
  createdAt: string;
}

export interface DashboardData {
  storeId: number;
  storeName: string;
  healthScore: number;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  repeatRate: number;
  topProducts: { name: string; revenue: number }[];
  summary: string;
  monthlyRevenueTrend: Record<string, number>;
  monthlyOrdersTrend: Record<string, number>;
  healthTrend: { reportId: number; createdAt: string; healthScore: number }[];
  latestUpload: {
    fileName: string;
    status: string;
    createdAt: string;
    storeName: string;
    totalRows?: number;
    report?: { reportId: number; healthScore: number; createdAt: string };
  } | null;
  latestReport: { reportId: number; healthScore: number; createdAt: string } | null;
}

// Payment API (Gumroad-based)
export const paymentApi = {
  createPayment: (data: { plan: string }) =>
    Promise.resolve({ data: wrapSuccess<{ paymentUrl: string; plan: string }>({ paymentUrl: `https://gumroad.com/l/store-leak`, plan: data.plan }) }) as any,

  getBilling: () =>
    api.get<any>("/payments").then((res) => {
      const list = res.data.data?.payments ?? [];
      const latest = list[0] ?? null;
      const totalPaid = list.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
      return {
        data: wrapSuccess<BillingData>({
          plan: latest?.productName || "FREE",
          status: latest?.status || "INACTIVE",
          totalPaid,
          nextBillingDate: null,
          paymentMethod: { type: "GUMROAD", last4: "****" },
          paymentHistory: list.map((p: any) => ({
            id: p.id,
            amount: Number(p.amount),
            currency: p.currency || "USD",
            status: p.status,
            date: p.createdAt,
            plan: p.productName,
          })),
        } as any),
      };
    }),

  getSubscription: () =>
    Promise.resolve({ data: wrapSuccess<Subscription>({ id: "N/A", plan: "FREE", status: "INACTIVE", startDate: null, endDate: null, cancelAtPeriodEnd: false } as any) }),

  getPaymentHistory: () =>
    api.get("/payments").then((res) => {
      const list = res.data.data?.payments ?? [];
      return {
        data: wrapSuccess<PaymentRecord[]>(
          list.map((p: any) => ({
            id: p.id,
            amount: Number(p.amount),
            currency: p.currency || "USD",
            status: p.status,
            date: p.createdAt,
            plan: p.productName,
          }))
        ),
      };
    }),

  cancelSubscription: () =>
    Promise.resolve({ data: wrapSuccess<{ message: string; plan: string }>({ message: "Managed via Gumroad portal", plan: "FREE" }) }),

  getUsage: () =>
    Promise.resolve({
      data: wrapSuccess<UsageSummary>({
        reportsUsed: 0,
        reportsLimit: 10,
        storesUsed: 0,
        storesLimit: 10,
        uploadsUsed: 0,
        uploadsLimit: 50,
        periodStart: new Date().toISOString(),
        periodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
      } as any),
    }),
};

// Admin API
export const adminApi = {
  getDashboard: () =>
    api.get<ApiResponse<AdminDashboardStats>>("/admin/dashboard"),

  listUsers: (search?: string, page = 0, size = 20) =>
    api.get<ApiResponse<AdminPageResponse<AdminUser>>>("/admin/users", { params: { search, page, size } }),

  updateUserPlan: (userId: number, plan: string) =>
    api.put<ApiResponse<void>>(`/admin/users/${userId}/plan`, { plan }),

  updateUserRole: (userId: number, role: string) =>
    api.put<ApiResponse<void>>(`/admin/users/${userId}/role`, { role }),

  toggleBanUser: (userId: number, banned: boolean) =>
    api.post<ApiResponse<void>>(`/admin/users/${userId}/ban`, { banned }),

  deleteUser: (userId: number) =>
    api.delete<ApiResponse<void>>(`/admin/users/${userId}`),

  listStores: (search?: string, page = 0, size = 20) =>
    api.get<ApiResponse<AdminPageResponse<AdminStore>>>("/admin/stores", { params: { search, page, size } }),

  deleteStore: (storeId: number) =>
    api.delete<ApiResponse<void>>(`/admin/stores/${storeId}`),

  listReports: (page = 0, size = 20) =>
    api.get<ApiResponse<AdminPageResponse<AdminReport>>>("/admin/reports", { params: { page, size } }),

  deleteReport: (reportId: number) =>
    api.delete<ApiResponse<void>>(`/admin/reports/${reportId}`),

  listPayments: (page = 0, size = 20) =>
    api.get<ApiResponse<AdminPageResponse<AdminPayment>>>("/admin/payments", { params: { page, size } }),

  listLogs: (type?: string, page = 0, size = 20) =>
    api.get<ApiResponse<AdminPageResponse<AdminLog>>>("/admin/logs", { params: { type, page, size } }),

  listWebhookLogs: (page = 0, size = 20) =>
    api.get<ApiResponse<AdminPageResponse<AdminLog>>>("/admin/logs/webhook", { params: { page, size } }),

  // ==================== System Settings ====================

  getSettingsGroup: () =>
    api.get<ApiResponse<AdminSystemSettings>>("/admin/settings"),

  updateSetting: (key: string, value: string) =>
    api.put<ApiResponse<void>>("/admin/settings", { key, value }),

  updateSettingsBatch: (settings: Record<string, string>) =>
    api.put<ApiResponse<void>>("/admin/settings/batch", { settings }),

  // ==================== Health Check ====================

  getHealthCheck: () =>
    api.get<ApiResponse<AdminHealthCheck>>("/admin/health-check"),

  // ==================== Deployment Info ====================

  getDeploymentInfo: () =>
    api.get<ApiResponse<AdminDeploymentInfo>>("/admin/deployment-info"),

  // ==================== Recent Logs ====================

  getRecentLogs: (level?: string, search?: string, limit = 100) =>
    api.get<ApiResponse<AdminRecentLogs>>("/admin/recent-logs", { params: { level, search, limit } }),

  // ==================== Sentry ====================

  testSentryError: () =>
    api.post<ApiResponse<string>>("/admin/sentry/test"),

  // ==================== PostHog ====================

  verifyPostHog: () =>
    api.post<ApiResponse<string>>("/admin/posthog/verify"),
};

export default api;
export { api };
