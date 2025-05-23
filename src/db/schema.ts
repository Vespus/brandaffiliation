import { pgTable, bigint, integer, real, unique, serial, varchar, text, boolean, timestamp, foreignKey, uuid, index, pgView, jsonb } from "drizzle-orm/pg-core"

export const brandScales = pgTable("brand_scales", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "brand_scales_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	brandId: integer("brand_id"),
	scaleId: integer("scale_id"),
	value: real(),
});

export const translations = pgTable("translations", {
	id: serial().primaryKey().notNull(),
	entityType: varchar("entity_type", { length: 20 }).notNull(),
	entityId: varchar("entity_id", { length: 50 }).notNull(),
	langCode: varchar("lang_code", { length: 10 }).notNull(),
	textValue: text("text_value").notNull(),
}, (table) => [
	unique("translations_entity_type_entity_id_lang_code_key").on(table.entityType, table.entityId, table.langCode),
]);

export const scales = pgTable("scales", {
	label: varchar({ length: 50 }).notNull(),
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "scales_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	scaleGroupId: bigint("scale_group_id", { mode: "number" }),
});

export const scaleGroups = pgTable("scale_groups", {
	label: varchar({ length: 50 }).notNull(),
	isAdditional: boolean("is_additional").default(false).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "scale_groups_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
});

export const aiSettingsDefault = pgTable("ai_settings_default", {
	id: serial().primaryKey().notNull(),
	model: text().notNull().notNull(),
	temperature: real().notNull(),
	topP: real("top_p").notNull(),
	maxTokens: integer("max_tokens").notNull().default(4000),
	frequencyPenalty: real("frequency_penalty").notNull(),
	presencePenalty: real("presence_penalty").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
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
}, (table) => [
	foreignKey({
			columns: [table.model],
			foreignColumns: [aiModels.modelName],
			name: "ai_settings_user_model_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	unique("ai_settings_user_user_id_model_key").on(table.userId, table.model),
]);

export const aiProviders = pgTable("ai_providers", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "ai_providers_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	name: varchar().default('255'),
	code: varchar().default('255'),
	key: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("ai_providers_code_key").on(table.code),
]);

export const aiModels = pgTable("ai_models", {
	id: serial().primaryKey().notNull(),
	providerId: integer("provider_id").notNull(),
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

export const characteristics = pgTable("characteristics", {
	id: serial().primaryKey().notNull(),
	brandId: integer("brand_id").notNull(),
	value: text().notNull(),
}, (table) => [
	index("similarity_gin").using("gin", table.value.asc().nullsLast().op("gin_trgm_ops")),
	index("similarity_gist").using("gist", table.value.asc().nullsLast().op("gist_trgm_ops")),
	foreignKey({
			columns: [table.brandId],
			foreignColumns: [brands.id],
			name: "fk_brand"
		}).onDelete("cascade"),
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
});

export const brands = pgTable("brands", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	slug: varchar(),
});

export const account = pgTable("account", {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id').notNull().references(() => users.id, {onDelete: 'cascade'}),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at'),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull()
});

export const session = pgTable("session", {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id').notNull().references(() => users.id, {onDelete: 'cascade'})
});

export const users = pgTable("user", {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').$defaultFn(() => false).notNull(),
	image: text('image'),
	createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
	updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const verification = pgTable("verification", {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()),
	updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date())
});

export const brandWithScales = pgTable("brand_with_scales", {
	id: integer('id').notNull(),
	name: text('name').notNull(),
	price: real('price').notNull(),
	quality: real('quality').notNull(),
	focus: real('focus').notNull(),
	design: real('design').notNull(),
	positioning: real('positioning').notNull(),
	origin: real('origin').notNull(),
	heritage: real('heritage').notNull(),
	recognition: real('recognition').notNull(),
	revenue: real('revenue').notNull(),
	characteristic: jsonb('characteristic').$type<{id: number, value: string}[]>(),
	slug: varchar()
})