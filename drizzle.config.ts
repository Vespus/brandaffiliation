import { env } from "@/env";
import type { Config } from "drizzle-kit";

export default {
    schema: "./src/db/schema.ts",
    dialect: "postgresql",
    out: "./src/db/",
    dbCredentials: {
        database: "postgres",
        host: "aws-0-eu-central-1.pooler.supabase.com",
        user: "postgres.nmgrlogjrnetqbommmym",
        password: "u2B0T0FSeGmC6aUR",
        port: 5432
    },
} satisfies Config;