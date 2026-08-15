import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '@/lib/server/prisma';
import { generateToken, setAuthCookies, clearAuthCookies, authenticateRequest } from '@/lib/server/auth';
import { parseBody, validateBody, idSchema } from '@/lib/server/validation';
import { ApiError, handleApiError } from '@/lib/server/validation';

export const dynamic = 'force-dynamic';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().max(100).optional(),
});
const loginSchema = z.object({ email: z.string().email(), password: z.string() });

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    if (action === 'register') {
      const body = await parseBody(req);
      const data = validateBody(body, registerSchema);
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing) throw new ApiError('Email already registered', 409);
      const hash = await bcrypt.hash(data.password, 12);
      const user = await prisma.user.create({
        data: { email: data.email, passwordHash: hash, name: data.name || data.email.split('@')[0] },
        select: { id: true, email: true, name: true, role: true },
      });
      const token = generateToken({ userId: user.id, email: user.email, role: user.role as 'USER' | 'ADMIN' });
      const res = NextResponse.json({ user, token });
      return setAuthCookies(res, token);
    }

    if (action === 'login') {
      const body = await parseBody(req);
      const d = validateBody(body, loginSchema);
      const user = await prisma.user.findUnique({ where: { email: d.email } });
      if (!user || !user.passwordHash || !await bcrypt.compare(d.password, user.passwordHash)) {
        throw new ApiError('Invalid credentials', 401);
      }
      const { passwordHash, ...safe } = user as any;
      const token = generateToken({ userId: user.id, email: user.email, role: user.role as 'USER' | 'ADMIN' });
      const res = NextResponse.json({ user: safe, token });
      return setAuthCookies(res, token);
    }

    if (action === 'logout') {
      const res = NextResponse.json({ success: true, message: 'Logged out' });
      return clearAuthCookies(res);
    }

    if (action === 'forgot-password') {
      const body = await parseBody(req);
      const { email } = validateBody(body, z.object({ email: z.string().email() }));
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        // Placeholder: in production send reset email.
        console.log('[auth] forgot password requested for:', email);
      }
      return NextResponse.json({ success: true, message: 'If this email is registered, a reset link has been sent.' });
    }

    if (action === 'reset-password') {
      const body = await parseBody(req);
      const schema = z.object({ token: z.string(), newPassword: z.string().min(8) });
      const { newPassword } = validateBody(body, schema);
      // Token validation omitted - integrate with email token table in production.
      return NextResponse.json({ success: true, message: 'Password reset logic placeholder.' });
    }

    throw new ApiError('Unknown auth action: ' + action, 404);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    if (action === 'me') {
      const auth = await authenticateRequest(req);
      const user = await prisma.user.findUnique({
        where: { id: auth.userId },
        select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true, deletedAt: true },
      });
      if (!user || user.deletedAt) throw new ApiError('User not found', 404);
      return NextResponse.json({ user });
    }

    throw new ApiError('Unknown auth action', 404);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();
    if (action !== 'profile') throw new ApiError('Not found', 404);
    const auth = await authenticateRequest(req);
    const body = await parseBody(req);
    const schema = z.object({ name: z.string().max(100).optional() });
    const data = validateBody(body, schema);
    const user = await prisma.user.update({
      where: { id: auth.userId }, data,
      select: { id: true, email: true, name: true, role: true },
    });
    return NextResponse.json({ user });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();
    if (action !== 'account') throw new ApiError('Not found', 404);
    const auth = await authenticateRequest(req);
    await prisma.user.update({ where: { id: auth.userId }, data: { deletedAt: new Date() } });
    const res = NextResponse.json({ success: true, message: 'Account scheduled for deletion' });
    return clearAuthCookies(res);
  } catch (err) {
    return handleApiError(err);
  }
}
