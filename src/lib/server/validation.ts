/**
 * Validation helpers - Zod schemas and request parsing for Next.js Route Handlers
 */

import { z, ZodError } from 'zod';
import { NextResponse } from 'next/server';

// ===== Custom API Error =====
export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  constructor(message: string, status = 400, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function handleApiError(err: unknown): Response {
  if (err instanceof ApiError) {
    return jsonError(err.status, err.code || String(err.status), err.message, err.details);
  }
  if (err instanceof ZodError) {
    return zodValidationError(err);
  }
  if (err && (err as any).name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as { code?: string; meta?: any };
    if (prismaErr.code === 'P2002') {
      const target = Array.isArray(prismaErr.meta?.target) ? prismaErr.meta.target.join(', ') : 'field';
      return jsonError(409, 'UNIQUE_CONSTRAINT', `Unique constraint violation: ${target}`);
    }
    if (prismaErr.code === 'P2025') return jsonError(404, 'NOT_FOUND', 'Record not found');
    if (prismaErr.code === 'P2003') return jsonError(400, 'FK_CONSTRAINT', 'Foreign key constraint failed');
  }
  if (err instanceof SyntaxError) return jsonError(400, 'BAD_JSON', 'Invalid JSON body');
  console.error('[api] Unhandled error:', err);
  const message = err instanceof Error ? err.message : 'Unknown error';
  const stack = err instanceof Error ? err.stack : undefined;
  return NextResponse.json(
    { error: 'INTERNAL_ERROR', message, stack },
    { status: 500 }
  );
}

export function jsonError(status: number, error: string, message: string, details?: unknown) {
  return NextResponse.json({ error, message, ...(details ? { details } : {}) }, { status });
}

export function zodValidationError(err: ZodError) {
  return jsonError(400, 'Validation Error', 'Invalid request data', {
    details: err.issues.map((e) => ({ field: e.path.join('.'), message: e.message })),
  });
}

// ===== Body / Query helpers =====
export async function parseBody<T extends z.ZodTypeAny>(
  request: Request,
  _schema?: T
): Promise<any> {
  try {
    const text = await request.text();
    return text ? JSON.parse(text) : {};
  } catch {
    throw new ApiError('Invalid JSON body', 400);
  }
}

export function validateBody<T extends z.ZodTypeAny>(body: any, schema: T): z.infer<T> {
  const result = schema.safeParse(body);
  if (!result.success) throw result.error;
  return result.data;
}

export function validateQuery<T extends z.ZodTypeAny>(params: Record<string, unknown>, schema: T): z.infer<T> {
  const result = schema.safeParse(params);
  if (!result.success) throw result.error;
  return result.data;
}

// ===== ID / param validation =====
export const idSchema = z.object({ id: z.string().uuid('Invalid ID') });

export function validateUuid(value: unknown, name = 'ID') {
  const r = z.string().uuid(`Invalid ${name}`).safeParse(value);
  if (!r.success) throw new ApiError(`Invalid ${name}`, 400, 'INVALID_UUID');
  return r.data;
}

export function parseBooleanParam(value: string | null | undefined) {
  if (value === null || value === undefined) return false;
  const v = value.toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

// ===== Legacy signatures (kept for existing callers) =====
/** @deprecated Use parseBody + validateBody instead */
export async function parseAndValidateBody<T extends z.ZodTypeAny>(request: Request, schema: T): Promise<z.infer<T>> {
  const body = await parseBody(request);
  return validateBody(body, schema);
}
/** @deprecated Use validateQuery instead */
export function parseQueryAndValidate<T extends z.ZodTypeAny>(url: URL, schema: T): z.infer<T> {
  const obj: Record<string, unknown> = {};
  for (const [k, v] of url.searchParams.entries()) obj[k] = v;
  return validateQuery(obj, schema);
}

// ===== Common Schemas =====

export const schemas = {
  register: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters').max(128),
    name: z.string().min(1).max(100).optional(),
  }),

  login: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8, 'Password must be at least 8 characters').max(128),
  }),

  uploadInit: z.object({
    fileName: z.string().min(1).max(255),
    fileSize: z.number().positive().max(100 * 1024 * 1024),
    storeId: z.string().uuid().optional(),
  }),

  createStore: z.object({
    shopDomain: z.string().min(1).regex(/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/),
    accessToken: z.string().min(1),
    storeName: z.string().max(100).optional(),
  }),

  updateStore: z.object({
    storeName: z.string().max(100).optional(),
    currency: z.string().length(3).optional(),
    timezone: z.string().max(50).optional(),
    isActive: z.boolean().optional(),
  }),

  updateUser: z.object({
    name: z.string().max(100).optional(),
    email: z.string().email().optional(),
  }),

  getReports: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    storeId: z.string().uuid().optional(),
    status: z.enum(['GENERATING', 'COMPLETED', 'FAILED']).optional(),
  }),

  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
    role: z.string().optional(),
    status: z.string().optional(),
    type: z.string().optional(),
    userId: z.string().optional(),
  }),

  uuidParam: z.object({
    id: z.string().uuid('Invalid ID format'),
  }),

  refresh: z.object({
    refreshToken: z.string().min(1),
  }),

  createPayment: z.object({
    plan: z.string().min(1),
  }),

  adminUpdateUser: z.object({
    role: z.enum(['USER', 'ADMIN']).optional(),
    name: z.string().optional(),
  }),
};

export type Schemas = typeof schemas;
