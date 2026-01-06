import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("3001"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 chars"),
  ALLOWED_ORIGINS: z.string().optional(),
  STORAGE_MODE: z.enum(["memory", "postgres"]).default("memory"),
  DATABASE_URL: z.string().optional(),
  QUEUE_MODE: z.enum(["inline", "redis"]).default("inline"),
  REDIS_URL: z.string().optional(),
  DATA_DIR: z.string().default(".data"),
  ALLOW_LOCAL_SOURCE: z.enum(["true", "false"]).default("false"),
  LOCAL_SOURCE_ROOT: z.string().optional(),
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
  storageMode: parsed.data.STORAGE_MODE,
  databaseUrl: parsed.data.DATABASE_URL,
  queueMode: parsed.data.QUEUE_MODE,
  redisUrl: parsed.data.REDIS_URL,
  dataDir: parsed.data.DATA_DIR,
  allowLocalSource: parsed.data.ALLOW_LOCAL_SOURCE === "true",
  localSourceRoot: parsed.data.LOCAL_SOURCE_ROOT,
  rateLimitWindowMs: Number(parsed.data.RATE_LIMIT_WINDOW_MS),
  rateLimitMax: Number(parsed.data.RATE_LIMIT_MAX)
};
