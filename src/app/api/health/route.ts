import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'store-leak-api', version: '1.0.0', uptime: process.uptime() });
}
