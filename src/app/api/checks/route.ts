/**
 * GET /api/checks → list current user's checks (paginated, newest first)
 * POST /api/checks → create a new check, queue & run engine (MVP: inline)
 * - Supports authenticated users (userId) and guests (guestId via cookie)
 */
export const maxDuration = 60; // Vercel Hobby plan max

import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/server/prisma";
import { authenticateRequest, optionalAuthRequest, getOrCreateGuestId, setGuestCookie } from "@/lib/server/auth";
import { ApiError, handleApiError, parseBody, validateBody } from "@/lib/server/validation";
import { PLANS } from "@/lib/planConfig";

const createSchema = z.object({
  targetUrl: z.string().trim().min(4, "URL too short").max(2048, "URL too long").refine(
    (v) => {
      try {
        let u = v;
        if (!/^https?:\/\//i.test(u)) u = "https://" + u;
        new URL(u);
        return true;
      } catch { return false; }
    },
    { message: "Invalid URL" }
  ),
  includeLighthouse: z.boolean().optional().default(true),
  includeSecurity: z.boolean().optional().default(true),
  includePerformance: z.boolean().optional().default(true),
  includeConfig: z.boolean().optional().default(true),
});

async function ensureQuota(userId: string) {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  const planId = sub?.plan ?? "FREE";
  const plan = PLANS.find((p) => p.id === planId) ?? PLANS[0];
  const monthStart = new Date();
  monthStart.setDate(1); monthStart.setHours(0,0,0,0);
  const usedThisMonth = await prisma.check.count({
    where: { userId, createdAt: { gte: monthStart } },
  });
  const limit = plan.maxChecksPerMonth;
  if (limit !== null && usedThisMonth >= limit) {
    throw new ApiError(
      `Monthly check limit reached for ${plan.name} plan (${limit}). Upgrade to run more.`,
      402,
      "QUOTA_EXCEEDED"
    );
  }
  return { sub, plan, usedThisMonth };
}

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const size = Math.min(100, Math.max(5, parseInt(searchParams.get("size") ?? "20", 10)));
    const skip = (page - 1) * size;

    const [items, total] = await Promise.all([
      prisma.check.findMany({
        where: { userId: user.userId },
        orderBy: { createdAt: "desc" },
        take: size,
        skip,
        include: { report: { select: { id: true, overallScore: true, status: true } } },
      }),
      prisma.check.count({ where: { userId: user.userId } }),
    ]);

    return NextResponse.json({
      code: 200,
      message: "success",
      data: {
        items: items.map((c) => ({
          id: c.id,
          targetUrl: c.targetUrl,
          status: c.status,
          progress: c.progress,
          currentStep: c.currentStep,
          errorMessage: c.errorMessage,
          includeLighthouse: c.includeLighthouse,
          includeSecurity: c.includeSecurity,
          includePerformance: c.includePerformance,
          includeConfig: c.includeConfig,
          startedAt: c.startedAt,
          completedAt: c.completedAt,
          createdAt: c.createdAt,
          report: c.report ? { id: c.report.id, overallScore: c.report.overallScore, status: c.report.status } : null,
        })),
        total,
        totalPages: Math.ceil(total / size),
        currentPage: page,
        pageSize: size,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await optionalAuthRequest(request);
    const isAuthenticated = "userId" in authResult;
    let userId: string | null = null;
    let guestId: string | null = null;
    let response: NextResponse = NextResponse.next();

    if (isAuthenticated) {
      const uid = (authResult as any).userId as string;
      userId = uid;
      try {
        await ensureQuota(uid);
        // Create subscription row if missing
        await prisma.subscription.upsert({
          where: { userId: uid },
          update: {},
          create: { userId: uid, plan: "FREE", status: "ACTIVE", checksUsedThisMonth: 0 },
        });
      } catch (quotaErr) {
        // Quota exceeded — fall back to guest mode so user can still scan
        userId = null;
        const { id: newGuestId, isNew } = getOrCreateGuestId(request);
        guestId = newGuestId;
        if (isNew) {
          response = setGuestCookie(response, guestId) as NextResponse;
        }
      }
    } else {
      // Guest user: get or issue guestId cookie
      const { id: newGuestId, isNew } = getOrCreateGuestId(request);
      guestId = newGuestId;
      if (isNew) {
        response = setGuestCookie(response, guestId) as NextResponse;
      }
    }

    const body = await parseBody(request);
    const input = validateBody(body, createSchema);

    const check = await prisma.check.create({
      data: {
        userId: userId || null,
        guestId: guestId || null,
        targetUrl: input.targetUrl.trim(),
        includeLighthouse: input.includeLighthouse,
        includeSecurity: input.includeSecurity,
        includePerformance: input.includePerformance,
        includeConfig: input.includeConfig,
        status: "RUNNING",
        startedAt: new Date(),
        progress: 10,
        currentStep: "Probing target URL",
      },
    });

    // TEMP: skip engine to test DB connection — return immediately
    const payload = {
      code: 201,
      message: "Check created (engine skipped for testing)",
      data: {
        checkId: check.id,
        status: "RUNNING",
        progress: 10,
        currentStep: "Probing target URL",
        reportId: null,
      },
    };

    const respHeaders: Record<string, string> = { "Content-Type": "application/json" };
    try {
      const setCookie = response.headers.get("set-cookie");
      if (setCookie) respHeaders["Set-Cookie"] = setCookie;
    } catch {}

    return new NextResponse(JSON.stringify(payload), {
      status: 200,
      headers: respHeaders,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
