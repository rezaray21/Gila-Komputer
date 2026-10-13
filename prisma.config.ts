import { defineConfig } from "prisma/config";
import fs from "node:fs";
import path from "node:path";

// Catatan: Prisma 6 dengan prisma.config.ts TIDAK memuat .env secara otomatis.
// Jadi baca & terapkan file .env di sini supaya DATABASE_URL (MySQL) tersedia.
for (const f of [".env", ".env.local"]) {
  const p = path.resolve(process.cwd(), f);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

export default defineConfig({
});
