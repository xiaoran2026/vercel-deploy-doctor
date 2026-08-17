import pg from "pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;
const needsSSL = connectionString.includes("neon.tech") || connectionString.includes("sslmode=require");

const pool = new Pool({
  connectionString,
  ssl: needsSSL ? { rejectUnauthorized: false } : undefined,
});

async function main() {
  try {
    const users = await pool.query("SELECT COUNT(*)::int FROM users");
    const checks = await pool.query("SELECT COUNT(*)::int FROM checks");
    const reports = await pool.query("SELECT COUNT(*)::int FROM reports");
    const findings = await pool.query("SELECT COUNT(*)::int FROM findings");

    console.log("\n📊 Deploy Doctor — Database Stats\n");
    console.log("  👤 Users     :", users.rows[0].count);
    console.log("  🔍 Checks    :", checks.rows[0].count);
    console.log("  📝 Reports   :", reports.rows[0].count);
    console.log("  🔎 Findings  :", findings.rows[0].count);
    console.log("");

    if (checks.rows[0].count > 0) {
      const status = await pool.query(
        "SELECT status, COUNT(*)::int FROM checks GROUP BY status ORDER BY status"
      );
      console.log("  Check status breakdown:");
      for (const row of status.rows) {
        console.log("   ·", row.status.padEnd(14), row.count);
      }
      console.log("");
    }

    if (users.rows[0].count > 0) {
      const recent = await pool.query(
        "SELECT email, created_at FROM users ORDER BY created_at DESC LIMIT 5"
      );
      console.log("  Recent sign-ups:");
      for (const row of recent.rows) {
        const t = new Date(row.created_at).toLocaleString("zh-CN");
        console.log("   ·", row.email.padEnd(35), t);
      }
      console.log("");
    }

    process.exit(0);
  } catch (e) {
    console.error("❌ Database error:", e.message);
    console.error("   ", e.stack ? e.stack.split("\n")[1].trim() : "");
    process.exit(1);
  }
}

main();
