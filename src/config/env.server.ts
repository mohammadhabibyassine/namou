import "server-only";

import { z } from "zod";

const serverEnvironmentSchema = z.object({
  SITE_URL: z.url().default("http://localhost:3001"),
  BACKEND_API_URL: z.url().default("http://localhost:3000"),
  BACKEND_REQUEST_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(10_000),
  AUTH_SESSION_SECRET: z.string().min(32),
  AUTH_REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(30),
});

export const serverEnvironment = serverEnvironmentSchema.parse({
  SITE_URL: process.env.SITE_URL,
  BACKEND_API_URL: process.env.BACKEND_API_URL,
  BACKEND_REQUEST_TIMEOUT_MS: process.env.BACKEND_REQUEST_TIMEOUT_MS,
  AUTH_SESSION_SECRET: process.env.AUTH_SESSION_SECRET,
  AUTH_REFRESH_TTL_DAYS: process.env.AUTH_REFRESH_TTL_DAYS,
});
