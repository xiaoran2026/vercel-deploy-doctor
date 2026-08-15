/**
 * Payment Service (Gumroad) — MVP stub
 *
 * Vercel Deploy Doctor uses external Gumroad links for pre-orders. The Prisma
 * schema no longer includes a Payment model (removed in the Store Leak →
 * Deploy Doctor migration), so all DB writes are stubbed with deterministic
 * in-memory returns. Webhook handling is preserved so it can be wired back up
 * when Payment persistence is added post-launch.
 */

import crypto from 'crypto';
import { config } from './config';
import prisma from './prisma';

export function verifyGumroadWebhook(payload: string, signature: string) {
  if (!config.gumroadSecret) return true;
  const expected = crypto.createHmac('sha256', config.gumroadSecret).update(payload).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
  } catch { return false; }
}

export function parseWebhookPayload(rawBody: string) {
  try {
    const p = JSON.parse(rawBody);
    if (!p.sale_id || !p.product_id || !p.customer_email) {
      console.error('[payment] Missing Gumroad fields');
      return null;
    }
    return p;
  } catch (err) {
    console.error('[payment] Parse webhook error:', err);
    return null;
  }
}

function mapPaymentStub(p: any) {
  return {
    id: p.id ?? p.sale_id ?? `pay_${Date.now()}`,
    userId: p.userId ?? '',
    gumroadSaleId: p.sale_id ?? null,
    amount: Number(p.amount ?? 0),
    currency: p.currency ?? 'USD',
    customerEmail: p.customer_email ?? p.customerEmail ?? '',
    customerName: p.customer_name ?? p.customerName ?? undefined,
    productName: p.product_name ?? p.productName ?? '',
    status: p.status ?? 'COMPLETED',
    createdAt: p.createdAt ?? new Date().toISOString(),
  };
}

export async function processGumroadWebhook(payload: any) {
  if (payload.test === 'true') {
    console.log('[payment] Skipping test:', payload.sale_id);
    return null;
  }
  const isRefunded =
    payload.refunded === 'true' ||
    payload.cancelled === 'true' ||
    payload.chargeback === 'true';

  let user = await prisma.user.findUnique({ where: { email: payload.customer_email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: payload.customer_email,
        name: payload.customer_name || payload.customer_email.split('@')[0],
        passwordHash: '',
        role: 'USER',
      },
    });
  }

  // MVP: no Payment table → return a derived stub record.
  return mapPaymentStub({
    ...payload,
    userId: user.id,
    status: isRefunded ? 'REFUNDED' : 'COMPLETED',
  });
}

export async function getUserPayments(_userId: string) {
  // MVP: no Payment table → return empty list.
  return [] as ReturnType<typeof mapPaymentStub>[];
}

export async function hasUserPurchased(_userId: string, _productId: string) {
  // MVP: no Payment table → rely on plan field on User row instead.
  return false;
}

export function createPaymentLink(productId: string, userEmail?: string) {
  const params = new URLSearchParams();
  if (userEmail) params.set('email', userEmail);
  return `https://gumroad.com/l/${productId}?${params.toString()}`;
}

export default {
  verifyGumroadWebhook,
  parseWebhookPayload,
  processGumroadWebhook,
  getUserPayments,
  hasUserPurchased,
  createPaymentLink,
};
