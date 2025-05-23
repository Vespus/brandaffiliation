import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        DATABASE_URL: z.string().url(),
        HOSTNAME: z.string().optional(),
        PORT: z.string().optional(),
        HCAPTCHA_TOKEN: z.string().optional(),
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
    },
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
    emptyStringAsUndefined: true,
});