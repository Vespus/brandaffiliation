import { drizzle } from "drizzle-orm/postgres-js";
import postgres, {Sql } from "postgres";


import * as schema from "./schema";
import * as relations from "./relations";
import {env} from "@/env";

let connection: Sql<{}>;

if (process.env.NODE_ENV === 'production') {
    connection = postgres(env.DATABASE_URL);
} else {
    const globalConnection = global as typeof globalThis & {
        connection: Sql<{}>;
    };

    if (!globalConnection.connection) globalConnection.connection = postgres(env.DATABASE_URL);

    connection = globalConnection.connection;
}

export const db = drizzle(connection, { schema: {...schema, ...relations}, logger: env.NODE_ENV !== 'production' });