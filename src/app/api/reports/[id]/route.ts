/**
 * GET  /api/reports/[id] → full report with findings
 */
import { NextResponse } from "next/server";
import prisma from "@/lib/server/prisma";
import { authenticateRequest } from "@/lib/server/auth";
import { handleApiError, ApiError } from "@/lib/server/validation";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await authenticateRequest(_request);
    const { id } = await params;

    // Accept either reportId or checkId for robustness
    let report = await prisma.report.findUnique({
      where: { id, userId: user.userId },
      include: {
        check: { select: { id: true, targetUrl: true, status: true, createdAt: true, completedAt: true } },
        findings: { orderBy: [{ severity: "asc" }, { category: "asc" }] },
      },
    });

    if (!report) {
      report = await prisma.report.findFirst({
        where: { checkId: id, userId: user.userId },
        include: {
          check: { select: { id: true, targetUrl: true, status: true, createdAt: true, completedAt: true } },
          findings: { orderBy: [{ severity: "asc" }, { category: "asc" }] },
        },
      });
    }

    if (!report) throw new ApiError("Report not found", 404, "NOT_FOUND");

    let summary: any = null;
    let deployChecks: any = null;
    try { summary = report.summary ? JSON.parse(report.summary) : null; } catch {}
    try { deployChecks = report.deployChecks ? JSON.parse(report.deployChecks) : null; } catch {}

    return NextResponse.json({
      code: 200,
      message: "success",
      data: {
        id: report.id,
        checkId: report.checkId,
        targetUrl: report.targetUrl,
        overallScore: report.overallScore,
        deployHealth: report.deployHealth,
        performanceScore: report.performanceScore,
        accessibilityScore: report.accessibilityScore,
        seoScore: report.seoScore,
        securityScore: report.securityScore,
        status: report.status,
        summary,
        deployChecks,
        createdAt: report.createdAt,
        completedAt: report.completedAt,
        check: report.check,
        findings: report.findings.map((f) => ({
          id: f.id,
          category: f.category,
          severity: f.severity,
          title: f.title,
          description: f.description,
          recommendation: f.recommendation,
          ruleId: f.ruleId,
          impact: f.impact,
          docsUrl: f.docsUrl,
        })),
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
