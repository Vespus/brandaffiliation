import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        DATABASE_URL: z.string().url(),
        HOSTNAME: z.string().optional(),
        PORT: z.string().optional(),
        HCAPTCHA_TOKEN: z.string().optional(),
        BETTER_AUTH_SECRET: z.string().optional(),
        QSPAY_API_KEY: z.string().optional(),
        QSPAY_URL: z.string().url().optional(),
    },
    client: {
        NEXT_PUBLIC_HCAPTCHA_SITE_KEY: z.string().optional(),
    },
    shared: {
        NODE_ENV: z.enum(["development", "test", "production"]),
    },
    runtimeEnv: {
        NODE_ENV: process.env.NODE_ENV || "development",
        HOSTNAME: process.env.HOSTNAME,
        HCAPTCHA_TOKEN: process.env.HCATPCHA_TOKEN,
        PORT: process.env.PORT,
        DATABASE_URL: process.env.DATABASE_URL,
        NEXT_PUBLIC_HCAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY,
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
        QSPAY_API_KEY: process.env.QSPAY_API_KEY,
        QSPAY_URL: process.env.QSPAY_URL
    },
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
    emptyStringAsUndefined: true,
});