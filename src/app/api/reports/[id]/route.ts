/**
 * GET  /api/reports/[id] → full report with findings
 * - Accepts either reportId or checkId for robustness
 * - Supports authenticated users (userId matches) and guests (guestId matches via cookie)
 */
export const maxDuration = 60;

import { NextResponse } from "next/server";
import prisma from "@/lib/server/prisma";
import { optionalAuthRequest, extractGuestId } from "@/lib/server/auth";
import { handleApiError, ApiError } from "@/lib/server/validation";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const authResult = await optionalAuthRequest(_request);
    const isAuthenticated = "userId" in authResult;
    const { id } = await params;

    let report: any = null;
    const includeOpts = {
      check: { select: { id: true, targetUrl: true, status: true, createdAt: true, completedAt: true } },
      findings: { orderBy: [{ severity: "asc" as const }, { category: "asc" as const }] },
    };

    if (isAuthenticated) {
      const userId = (authResult as any).userId;
      report = await prisma.report.findUnique({
        where: { id, userId },
        include: includeOpts,
      });
      if (!report) {
        report = await prisma.report.findFirst({
          where: { checkId: id, userId },
          include: includeOpts,
        });
      }
      // Fallback: report may have been created in guest mode (quota exceeded)
      // Try guestId lookup if userId lookup failed
      if (!report) {
        const guestId = extractGuestId(_request);
        if (guestId) {
          report = await prisma.report.findUnique({
            where: { id, guestId },
            include: includeOpts,
          });
          if (!report) {
            report = await prisma.report.findFirst({
              where: { checkId: id, guestId },
              include: includeOpts,
            });
          }
        }
      }
    } else {
      const guestId = extractGuestId(_request);
      if (!guestId) throw new ApiError("Unauthorized", 401, "UNAUTHORIZED");
      report = await prisma.report.findUnique({
        where: { id, guestId },
        include: includeOpts,
      });
      if (!report) {
        report = await prisma.report.findFirst({
          where: { checkId: id, guestId },
          include: includeOpts,
        });
      }
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
        findings: report.findings.map((f: any) => ({
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
