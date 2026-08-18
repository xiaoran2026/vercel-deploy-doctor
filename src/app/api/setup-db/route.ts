import { NextResponse } from "next/server";
import prisma from "@/lib/server/prisma";

// One-time schema sync: adds guestId columns + waitlist_entries table
// Call: GET /api/setup-db?key=<ADMIN_STATS_KEY>
export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  if (key !== process.env.ADMIN_STATS_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: string[] = [];

  // 1. checks: add guestId column, make userId nullable
  try {
    await prisma.$executeRaw`ALTER TABLE "checks" ADD COLUMN IF NOT EXISTS "guestId" TEXT`;
    results.push("checks.guestId column added");
  } catch (e: any) {
    results.push(`checks.guestId: ${e.message}`);
  }
  try {
    await prisma.$executeRaw`ALTER TABLE "checks" ALTER COLUMN "userId" DROP NOT NULL`;
    results.push("checks.userId set nullable");
  } catch (e: any) {
    results.push(`checks.userId nullable: ${e.message}`);
  }

  // 2. reports: add guestId column, make userId nullable
  try {
    await prisma.$executeRaw`ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "guestId" TEXT`;
    results.push("reports.guestId column added");
  } catch (e: any) {
    results.push(`reports.guestId: ${e.message}`);
  }
  try {
    await prisma.$executeRaw`ALTER TABLE "reports" ALTER COLUMN "userId" DROP NOT NULL`;
    results.push("reports.userId set nullable");
  } catch (e: any) {
    results.push(`reports.userId nullable: ${e.message}`);
  }

  // 3. waitlist_entries table
  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "waitlist_entries" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "plan" TEXT NOT NULL DEFAULT 'STARTER',
        "message" TEXT,
        "source" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "waitlist_entries_pkey" PRIMARY KEY ("id")
      )
    `;
    results.push("waitlist_entries table created");
  } catch (e: any) {
    results.push(`waitlist_entries table: ${e.message}`);
  }
  try {
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "waitlist_entries_email_plan_key"
      ON "waitlist_entries"("email", "plan")
    `;
    results.push("waitlist_entries unique index created");
  } catch (e: any) {
    results.push(`waitlist_entries unique index: ${e.message}`);
  }
  try {
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "waitlist_entries_createdAt_idx"
      ON "waitlist_entries"("createdAt")
    `;
    results.push("waitlist_entries createdAt index created");
  } catch (e: any) {
    results.push(`waitlist_entries createdAt index: ${e.message}`);
  }

  return NextResponse.json({ ok: true, results });
}
