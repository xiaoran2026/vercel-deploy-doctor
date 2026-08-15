/**
 * Stub for legacy task processor referenced by cron route.
 * Vercel Deploy Doctor runs checks synchronously within the POST /api/checks handler
 * (MVP design). This module exists only to satisfy imports from the copied
 * cron/tasks route. The actual scheduled regressions are on the roadmap.
 */
export type PendingTask = {
  id: string;
  type: "DEPLOY_CHECK" | string;
  payload: Record<string, unknown>;
};

export async function processNextTask(): Promise<{ processed: number }> {
  return { processed: 0 };
}

export async function queueTask(_type: string, _payload: Record<string, unknown>): Promise<void> {
  // no-op in MVP
}

export async function processAllScheduled(): Promise<{ processed: number }> {
  return { processed: 0 };
}

export async function processQueuedTasks(limit: number = 5): Promise<{ processed: number; results: unknown[] }> {
  return { processed: 0, results: [] };
}

export async function cleanupOldBlobs(daysOld: number = 30): Promise<{ deleted: number }> {
  return { deleted: 0 };
}
