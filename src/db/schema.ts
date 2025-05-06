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
    primaryKey, pgView,
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
    brandId: integer("brand_id").references(() => brand.id).notNull(),
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
    temperature: integer('temperature'),
    topP: integer('top_p'),
    maxTokens: integer('max_tokens'),
    frequencyPenalty: integer('frequency_penalty'),
    presencePenalty: integer('presence_penalty'),
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

export const brandWithScales = pgView("brand_with_scales", {
    id: integer('id').notNull(),
    name: text('name').notNull(),
    price: real('price'),
    quality: real('quality'),
    focus: real('focus'),
    design: real('design'),
    positioning: real('positioning'),
    origin: real('origin'),
    heritage: real('heritage'),
    recognition: real('recognition'),
    revenue: real('revenue'),
    characteristic: jsonb('characteristic').$type<{id: number, value: string}[]>(),
}).existing()

export type Brand = typeof brand.$inferSelect;
export type BrandWithCharacteristic = Brand & { characteristic?: Characteristic[] };
export type BrandWithCharacteristicAndScales = typeof brandWithScales.$inferSelect

export type Scale = typeof scales.$inferSelect
export type BrandScale = typeof brandScales.$inferSelect
export type BrandScaleWithScale = BrandScale & { scale: Scale }

export type Characteristic = typeof characteristic.$inferSelect;
export type NewCharacteristic = typeof characteristic.$inferInsert;

export type Provider = typeof provider.$inferSelect

export type AIModel = typeof aiModels.$inferSelect
export type AIModelWithProvider = AIModel & { provider: Provider }

export type Translation = typeof translations.$inferSelect
export type NewTranslation = typeof translations.$inferInsert
