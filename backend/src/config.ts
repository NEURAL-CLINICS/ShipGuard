import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("3001"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 chars"),
  ALLOWED_ORIGINS: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.string().default("60000"),
  RATE_LIMIT_MAX: z.string().default("120")
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.flatten().fieldErrors;
  console.error("Invalid environment configuration", issues);
  process.exit(1);
}

const allowedOrigins = parsed.data.ALLOWED_ORIGINS
  ? parsed.data.ALLOWED_ORIGINS.split(",").map((value) => value.trim()).filter(Boolean)
  : undefined;

export const config = {
  port: Number(parsed.data.PORT),
  jwtSecret: parsed.data.JWT_SECRET,
  allowedOrigins,
  rateLimitWindowMs: Number(parsed.data.RATE_LIMIT_WINDOW_MS),
  rateLimitMax: Number(parsed.data.RATE_LIMIT_MAX)
};
