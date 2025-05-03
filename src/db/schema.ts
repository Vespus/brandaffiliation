import {
	pgTable,
	serial,
	integer,
	text,
	boolean,
	timestamp,
	uuid,
	varchar,
	uniqueIndex,
	primaryKey
} from "drizzle-orm/pg-core"

export const translations = pgTable('translations', {
	id: serial('id').notNull(),
	entityType: varchar('entity_type', { length: 20 }).notNull(),
	entityId: varchar('entity_id', { length: 50 }).notNull(),
	langCode: varchar('lang_code', { length: 10 }).notNull(),
	textValue: text('text_value').notNull(),
}, (table) => ({
	pk: primaryKey({ columns: [table.id] }),
	uniqueConstraint: uniqueIndex('translations_entity_type_entity_id_lang_code_key').on(
		table.entityType, 
		table.entityId, 
		table.langCode
	)
}));

export const users = pgTable('users', {
	id: uuid('id').primaryKey(),
	fullName: text('full_name'),
	phone: varchar('phone', { length: 256 }),
});

export const brand = pgTable("brands", {
	id: serial().notNull(),
	name: text().notNull(),
	price: integer(),
	quality: integer(),
	design: integer(),
	focus: integer(),
	positioning: integer(),
	heritage: integer(),
	origin: integer(),
	fame: integer(),
	sales_volume: integer(),
});

export const characteristic = pgTable("characteristics", {
	id: serial().notNull(),
	brandId: integer("brand_id").references(() => brand.id).notNull(),
	value: text().notNull(),
});

export const provider = pgTable("ai_providers", {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	code: text().notNull().unique(),
	key: text('key').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const aiModels = pgTable('ai_models', {
	id: serial('id').primaryKey(),
	providerId: integer('provider_id').references(() => provider.id).notNull(),
	modelName: text('model_name').notNull().unique(),
	name: text('name').notNull(),
	description: text('description'),
	isActive: boolean('is_active').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const aiSettingsDefault = pgTable('ai_settings_default', {
	id: serial('id').primaryKey(),
	model: text('model').notNull(),
	temperature: integer('temperature'),
	topP: integer('top_p'),
	maxTokens: integer('max_tokens'),
	frequencyPenalty: integer('frequency_penalty'),
	presencePenalty: integer('presence_penalty'),
	prompt: text(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const aiSettingsUser = pgTable('ai_settings_user', {
	id: serial('id').primaryKey(),
	userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	model: text('model').notNull(),
	temperature: integer('temperature'),
	topP: integer('top_p'),
	maxTokens: integer('max_tokens'),
	frequencyPenalty: integer('frequency_penalty'),
	presencePenalty: integer('presence_penalty'),
	prompt: text(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
	userModelUnique: uniqueIndex('ai_settings_user_user_id_model_unique').on(table.userId, table.model),
}));

export type Brand = typeof brand.$inferSelect;
export type BrandWithCharacteristic = Brand & { characteristic?: Characteristic[] };

export type Characteristic = typeof characteristic.$inferSelect;
export type NewCharacteristic = typeof characteristic.$inferInsert;

export type Provider = typeof provider.$inferSelect

export type AIModel = typeof aiModels.$inferSelect
export type AIModelWithProvider = AIModel & { provider: Provider }

export type Translation = typeof translations.$inferSelect
export type NewTranslation = typeof translations.$inferInsert
