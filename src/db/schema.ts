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
    primaryKey,
    real, jsonb
} from "drizzle-orm/pg-core"

export const translations = pgTable('translations', {
    id: serial('id').notNull(),
    entityType: varchar('entity_type', {length: 20}).notNull(),
    entityId: varchar('entity_id', {length: 50}).notNull(),
    langCode: varchar('lang_code', {length: 10}).notNull(),
    textValue: text('text_value').notNull(),
}, (table) => ({
    pk: primaryKey({columns: [table.id]}),
    uniqueConstraint: uniqueIndex('translations_entity_type_entity_id_lang_code_key').on(
        table.entityType,
        table.entityId,
        table.langCode
    )
}));

export const users = pgTable('users', {
    id: uuid('id').primaryKey(),
    fullName: text('full_name'),
    phone: varchar('phone', {length: 256}),
});

export const brands = pgTable("brands", {
    id: serial().notNull(),
    name: text().notNull(),
    slug: varchar()
});

export const characteristic = pgTable("characteristics", {
    id: serial().notNull(),
    brandId: integer("brand_id").references(() => brands.id).notNull(),
    value: text().notNull(),
});

export const provider = pgTable("ai_providers", {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    code: text().notNull().unique(),
    key: text('key').notNull(),
    createdAt: timestamp('created_at', {withTimezone: true}).defaultNow(),
})

export const scaleGroup = pgTable("scale_groups", {
    id: serial('id').primaryKey(),
    label: varchar('label').notNull(),
    createdAt: timestamp('created_at', {withTimezone: true}).defaultNow(),
})

export const scales = pgTable("scales", {
    id: serial("id").primaryKey(),
    label: varchar("label").notNull(),
    scaleGroupId: varchar("scale_group_id").references(() => scaleGroup.id).notNull(),
})

export const brandScales = pgTable("brand_scales", {
    id: serial("id").primaryKey(),
    brandId: integer("brand_id").references(() => brands.id).notNull(),
    scaleId: integer("scale_id").references(() => scales.id).notNull(),
    value: integer("value").notNull(),
})

export const aiModels = pgTable('ai_models', {
    id: serial('id').primaryKey(),
    providerId: integer('provider_id').references(() => provider.id).notNull(),
    modelName: text('model_name').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
    isActive: boolean('is_active').notNull().default(false),
    createdAt: timestamp('created_at', {withTimezone: true}).defaultNow(),
    updatedAt: timestamp('updated_at', {withTimezone: true}).defaultNow(),
});

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

export const aiSettingsUser = pgTable('ai_settings_user', {
    id: serial('id').primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, {onDelete: 'cascade'}),
    model: text('model').notNull(),
    temperature: integer('temperature'),
    topP: integer('top_p'),
    maxTokens: integer('max_tokens'),
    frequencyPenalty: integer('frequency_penalty'),
    presencePenalty: integer('presence_penalty'),
    prompt: text(),
    createdAt: timestamp('created_at', {withTimezone: true}).defaultNow(),
    updatedAt: timestamp('updated_at', {withTimezone: true}).defaultNow(),
}, (table) => ({
    userModelUnique: uniqueIndex('ai_settings_user_user_id_model_unique').on(table.userId, table.model),
}));

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

export const userPrompts = pgTable('user_prompts', {
    id: integer('id').primaryKey(),
    userId: uuid('user_id').default('auth.uid()'),
    name: text('name'),
    prompt: text('prompt'),
    isFavorite: boolean('is_favorite').default(false),
    updatedAt: timestamp('updated_at').defaultNow(),
    createdAt: timestamp('created_at', {withTimezone: true}).defaultNow().notNull(),
});

export type Brand = typeof brands.$inferSelect;
export type BrandWithCharacteristicAndScales = typeof brandWithScales.$inferSelect

export type Scale = typeof scales.$inferSelect
export type BrandScale = typeof brandScales.$inferSelect

export type Characteristic = typeof characteristic.$inferSelect;

export type Provider = typeof provider.$inferSelect
export type AISetting = typeof aiSettingsDefault.$inferSelect
export type AIModel = typeof aiModels.$inferSelect
export type AIModelWithProvider = AIModel & { provider: Provider }
export type AIModelWithProviderAndSettings = AIModelWithProvider & { settings: AISetting }

export type Translation = typeof translations.$inferSelect
