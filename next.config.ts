import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  // rewrites 已删除：API 现在使用 Next.js Route Handlers（app/api/*），同源即可。
  experimental: {
    // 提升 serverActions bodySize 限制，方便 CSV 上传（但我们主要走 Blob，无需调整此项太大）
    // serverActions: { bodySizeLimit: "25mb" },
  },
};

export default nextConfig;
