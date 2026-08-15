/**
 * Server-side config (safe to include secrets - NEVER expose to client)
 */

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-in-production-min-32chars!!',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // DeepSeek AI
  deepseekApiKey: process.env.DEEPSEEK_API_KEY || '',
  deepseekBaseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
  deepseekModel: process.env.DEEPSEEK_MODEL || 'deepseek-chat',

  // Gumroad
  gumroadSecret: process.env.GUMROAD_SECRET || '',
  gumroadProductId: process.env.GUMROAD_PRODUCT_ID || '',

  // Store Token Encryption (32 chars exactly)
  storeTokenEncryptionKey:
    process.env.STORE_TOKEN_ENCRYPTION_KEY || 'your-32-char-encryption-key-here!!',

  // File Upload
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
  maxRows: parseInt(process.env.MAX_ROWS || '50000', 10),

  // CORS / Frontend
  frontendUrl: process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.FRONTEND_URL || 'http://localhost:3000',
  corsOrigin: process.env.CORS_ORIGIN || process.env.NEXT_PUBLIC_FRONTEND_URL || '*',

  // Rate Limiting (per IP per window)
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  // Vercel Cron secret - protect /api/cron/* routes
  cronSecret: process.env.CRON_SECRET || 'dev-cron-secret-change-me',
} as const;

// Validation in production
if (config.nodeEnv === 'production') {
  const required = ['DATABASE_URL', 'JWT_SECRET'] as const;
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    console.warn('[config] Missing required env vars:', missing.join(', '));
  }
}

export default config;
