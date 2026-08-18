import type { PrismaConfig } from "prisma/config";

const config: PrismaConfig = {
  earlyAccess: true,
  migrations: {
    datasource: {
      url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/storeleak?schema=public",
    },
  },
};

export default config;
