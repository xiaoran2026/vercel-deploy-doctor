/**
 * Auth Service - JWT + bcrypt
 * Server-only module (never import in client components)
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { config } from './config';
import prisma from './prisma';
import { ApiError } from './validation';

const ACCESS_TOKEN_EXPIRY = '30d'; // longer for simplicity

export type TokenPayload = {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN';
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

/** Simplified single-token generator */
export function generateToken(payload: TokenPayload) {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: ACCESS_TOKEN_EXPIRY, issuer: 'store-leak', audience: 'store-leak-api',
  });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, config.jwtSecret, { issuer: 'store-leak', audience: 'store-leak-api' }) as TokenPayload;
  } catch {
    return null;
  }
}

const COOKIE_NAME = 'auth_token';

/** Attach cookie to outgoing Response by cloning with added Set-Cookie header */
export function setAuthCookies(response: Response, token: string): Response {
  const headers = new Headers(response.headers);
  headers.append(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`
  );
  return new Response(response.body, { headers, status: response.status, statusText: response.statusText });
}

export function clearAuthCookies(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.append('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
  return new Response(response.body, { headers, status: response.status, statusText: response.statusText });
}

type AuthenticatedContext = {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN';
};

/**
 * Authenticate a Next.js Request via Authorization: Bearer header (or cookie fallback).
 * Throws ApiError (401) on failure.
 */
export async function authenticateRequest(request: Request): Promise<AuthenticatedContext> {
  const header = request.headers.get('authorization');
  let token: string | null = null;
  if (header && header.startsWith('Bearer ')) token = header.substring(7);
  // Cookie fallback (setAuthCookies)
  if (!token) {
    const cookie = request.headers.get('cookie') || '';
    const match = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
    if (match) token = match[1];
  }
  if (!token) throw new ApiError('Missing authentication', 401, 'UNAUTHORIZED');
  const payload = verifyAccessToken(token);
  if (!payload) throw new ApiError('Invalid or expired token', 401, 'UNAUTHORIZED');
  // Ensure user still exists (not soft-deleted)
  const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { id: true, deletedAt: true, role: true, email: true } });
  if (!user || user.deletedAt) throw new ApiError('User not found', 401, 'UNAUTHORIZED');
  return { userId: user.id, email: user.email || payload.email, role: (user.role as any) || 'USER' };
}

export async function requireAdmin(ctx: AuthenticatedContext): Promise<void> {
  if (ctx.role !== 'ADMIN') throw new ApiError('Forbidden: admin role required', 403, 'FORBIDDEN');
}

export async function optionalAuthRequest(request: Request): Promise<AuthenticatedContext | { user: null }> {
  try {
    return await authenticateRequest(request);
  } catch {
    return { user: null };
  }
}
