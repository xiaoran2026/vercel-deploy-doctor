import { NextResponse } from 'next/server';
import { processQueuedTasks, cleanupOldBlobs } from '@/lib/server/taskProcessor';
import { handleApiError } from '@/lib/server/validation';
import { config } from '@/lib/server/config';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Called by Vercel Cron on schedule (see vercel.json).
 * Also callable manually with header x-cron-secret or Authorization cron-secret (BYPASS in dev).
 */
export async function GET(req: Request) {
  try {
    // 授权检查：Vercel Cron 在调用时会附带 x-vercel-cron-authorized 或 Authorization: Bearer <CRON_SECRET>
    const authz = req.headers.get('authorization');
    const secret = req.headers.get('x-cron-secret');
    const isCron = req.headers.get('x-vercel-cron-authorized') === '1' || req.headers.get('x-vercel-cron') === '1';
    const tokenOk = (authz && authz.startsWith('Bearer ') && authz.slice(7) === config.cronSecret)
      || (secret && secret === config.cronSecret);
    if (!isCron && !tokenOk && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = new URL(req.url).searchParams;
    const limit = Math.min(10, parseInt(params.get('limit') || '5', 10));
    const result = await processQueuedTasks(limit);

    // 额外维护：清理旧文件（30天以上）
    try {
      const cleanup = await cleanupOldBlobs(30);
      console.log('[cron] cleanup:', cleanup);
    } catch (e) { /* noop */ }

    return NextResponse.json({
      ok: true,
      processedAt: new Date().toISOString(),
      queued: result.processed,
      results: result.results,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
