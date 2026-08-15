import { defineConfig } from 'prisma/config';

// Prisma 7 config: datasource provides url; fallback allows `prisma generate` locally.
// Production uses DATABASE_URL from Vercel env vars.
const fallbackDbUrl =
  'postgresql://postgres:postgres@localhost:5432/storeleak?schema=public&pgbouncer=true';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || fallbackDbUrl,
  },
  migrations: {
    path: './migrations',
  },
});
