
import { env } from "@/env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";
import * as relations from "./relations";

// Global variable to store our singleton instances
declare global {
    var __db: ReturnType<typeof drizzle> | undefined;
    var __client: ReturnType<typeof postgres> | undefined;
}

// Create singleton client and db instances
function createDatabase() {
    if (!global.__client) {
        global.__client = postgres(env.DATABASE_URL, {
            // Optional: Configure connection pool settings
            max: 10, // Maximum number of connections
            idle_timeout: 20, // Close idle connections after 20 seconds
            connect_timeout: 10, // Connection timeout in seconds
        });
    }

    if (!global.__db) {
        global.__db = drizzle(global.__client, {
            schema: { ...schema, ...relations },
            logger: false
        });
    }

    return { client: global.__client, db: global.__db };
}

// Export the singleton instances
const { client, db } = createDatabase();

export { client, db };