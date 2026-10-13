import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL zaroori hai"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET kam se kam 32 character ka ho"),
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const problems = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
  console.error(".env me galti:", problems.join(" | "));
  process.exit(1);
}

export const env = parsed.data;