/**
 * GET  /api/checks/[id] → status/progress for one check (frontend polling)
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
    const check = await prisma.check.findUnique({
      where: { id, userId: user.userId },
      include: { report: { select: { id: true, overallScore: true, status: true } } },
    });
    if (!check) throw new ApiError("Check not found", 404, "NOT_FOUND");
    return NextResponse.json({
      code: 200,
      message: "success",
      data: {
        checkId: check.id,
        status: check.status,
        progress: check.progress,
        currentStep: check.currentStep,
        errorMessage: check.errorMessage,
        startedAt: check.startedAt,
        completedAt: check.completedAt,
        createdAt: check.createdAt,
        reportId: check.report?.id ?? null,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
