/**
 * POST /api/waitlist → Submit a waitlist entry (stored in DB)
 * GET  /api/waitlist → (Admin only) List waitlist entries
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/server/prisma";
import { authenticateRequest, requireAdmin } from "@/lib/server/auth";
import { handleApiError, parseBody, validateBody } from "@/lib/server/validation";

const waitlistSchema = z.object({
  email: z.string().email("Invalid email address"),
  plan: z.enum(["STARTER", "GROWTH", "AGENCY"]).default("STARTER"),
  message: z.string().optional(),
  source: z.string().optional(), // e.g. "pricing", "report-banner", "hero-cta"
});

export async function POST(request: Request) {
  try {
    const body = await parseBody(request);
    const input = validateBody(body, waitlistSchema);

    // Idempotent: if already on waitlist for this plan, return the existing row
    const existing = await prisma.waitlistEntry.findUnique({
      where: { email_plan: { email: input.email, plan: input.plan } },
    });

    if (existing) {
      return NextResponse.json({
        code: 200,
        message: "Already on waitlist",
        data: { id: existing.id },
      });
    }

    const entry = await prisma.waitlistEntry.create({
      data: {
        email: input.email,
        plan: input.plan,
        message: input.message,
        source: input.source,
      },
    });

    return NextResponse.json({
      code: 201,
      message: "Added to waitlist",
      data: { id: entry.id },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function GET(request: Request) {
  try {
    const ctx = await authenticateRequest(request);
    await requireAdmin(ctx);
    const { searchParams } = new URL(request.url);
    const take = Math.min(500, Math.max(1, parseInt(searchParams.get("limit") ?? "100", 10)));

    const entries = await prisma.waitlistEntry.findMany({
      orderBy: { createdAt: "desc" },
      take,
    });

    return NextResponse.json({
      code: 200,
      message: "success",
      data: entries,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
