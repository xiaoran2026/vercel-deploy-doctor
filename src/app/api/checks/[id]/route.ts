/**
 * GET  /api/checks/[id] → status/progress for one check (frontend polling)
 * - Supports authenticated users (userId matches) and guests (guestId matches via cookie)
 */
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

    let check = null;
    if (isAuthenticated) {
      check = await prisma.check.findUnique({
        where: { id, userId: (authResult as any).userId },
        include: { report: { select: { id: true, overallScore: true, status: true } } },
      });
    } else {
      const guestId = extractGuestId(_request);
      if (!guestId) throw new ApiError("Unauthorized", 401, "UNAUTHORIZED");
      check = await prisma.check.findUnique({
        where: { id, guestId },
        include: { report: { select: { id: true, overallScore: true, status: true } } },
      });
    }

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
