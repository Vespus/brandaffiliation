import { pgTable, serial, integer, text } from "drizzle-orm/pg-core"


export const brand = pgTable("brands", {
	id: serial().notNull(),
	name: text().notNull(),
	attributePrice: integer("attribute_price").default(0),
	attributeDesign: integer("attribute_design"),
	attributeFame: integer("attribute_fame"),
	attributeProductRange: integer("attribute_product_range"),
	attributePositioning: integer("attribute_positioning"),
});

export const characteristic = pgTable("characteristics", {
	id: serial().notNull(),
	brandId: integer("brand_id").references(() => brand.id).notNull(),
	value: text().notNull(),
});

export const scaleGroups = pgTable('scale_groups', {
	id: serial('id').primaryKey(),
	name: text().notNull(),
});

export const scale = pgTable("scales", {
	id: serial().notNull(),
	name: text().notNull(),
	group_id: integer("group_id").references(() => scaleGroups.id).notNull(),
})

export const brandScales = pgTable('brand_scales', {
	id: serial('id').primaryKey(),
	brandId: integer("brand_id").references(() => brand.id).notNull(),
	scaleId: integer('scale_id').references(() => scale.id).notNull(),
	value: integer('value').notNull(),
});

export type Brand = typeof brand.$inferSelect;
export type BrandWithCharacteristic = Brand & { characteristic: Characteristic[] };
export type NewBrand = typeof brand.$inferInsert;

export type Characteristic = typeof characteristic.$inferSelect;
export type NewCharacteristic = typeof characteristic.$inferInsert;