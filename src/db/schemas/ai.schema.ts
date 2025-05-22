import {
    bigint,
    boolean,
    foreignKey,
    integer,
    pgTable,
    real,
    serial,
    text,
    timestamp, unique,
    uuid,
    varchar
} from "drizzle-orm/pg-core";
import { user } from "@/db/schemas/auth.schema";

export const aiModels = pgTable("ai_models", {
    id: serial().primaryKey().notNull(),
    providerId: integer("provider_id"),
    modelName: text("model_name").notNull(),
    name: text().notNull(),
    description: text(),
    isActive: boolean("is_active").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
    foreignKey({
        columns: [table.providerId],
        foreignColumns: [aiProviders.id],
        name: "ai_models_provider_id_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
    unique("ai_models_model_name_key").on(table.modelName),
]);

export const aiSettingsDefault = pgTable('ai_settings_default', {
    id: serial('id').primaryKey(),
    model: text('model').notNull(),
    temperature: integer('temperature').notNull(),
    topP: integer('top_p').notNull(),
    maxTokens: integer('max_tokens').notNull(),
    frequencyPenalty: integer('frequency_penalty').notNull(),
    presencePenalty: integer('presence_penalty').notNull(),
    prompt: text(),
    createdAt: timestamp('created_at', {withTimezone: true}).defaultNow(),
    updatedAt: timestamp('updated_at', {withTimezone: true}).defaultNow(),
});

export const aiSettingsUser = pgTable("ai_settings_user", {
    id: serial().primaryKey().notNull(),
    userId: uuid("user_id"),
    model: text().notNull(),
    temperature: real(),
    topP: real("top_p"),
    maxTokens: integer("max_tokens"),
    frequencyPenalty: real("frequency_penalty"),
    presencePenalty: real("presence_penalty"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    prompt: text(),
}, (table) => [
    foreignKey({
        columns: [table.model],
        foreignColumns: [aiModels.modelName],
        name: "ai_settings_user_model_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
    foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "ai_settings_user_user_id_fkey"
    }).onDelete("cascade"),
    unique("ai_settings_user_user_id_model_key").on(table.userId, table.model),
]);


export const aiProviders = pgTable("ai_providers", {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "ai_providers_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
    name: varchar().default('255'),
    code: varchar().default('255'),
    key: text(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
    unique("ai_providers_code_key").on(table.code),
]);

export const userPrompts = pgTable("user_prompts", {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "user_prompts_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
    userId: uuid("user_id"),
    name: text(),
    prompt: text(),
    isFavorite: boolean("is_favorite").default(false),
    updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
    foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "user_prompts_user_id_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
]);
