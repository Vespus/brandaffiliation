import { pgTable, foreignKey, serial, integer, text } from "drizzle-orm/pg-core"

export const characteristic = pgTable("characteristics", {
	id: serial().notNull(),
	brandId: integer("brand_id").notNull(),
	value: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.brandId],
			foreignColumns: [brand.id],
			name: "fk_brand"
		}).onDelete("cascade"),
]);

export const brand = pgTable("brands", {
	id: serial().notNull(),
	name: text().notNull(),
	attributePrice: integer("attribute_price").default(0),
	attributeDesign: integer("attribute_design"),
	attributeFame: integer("attribute_fame"),
	attributeProductRange: integer("attribute_product_range"),
	attributePositioning: integer("attribute_positioning"),
});

export type Brand = typeof brand.$inferSelect;
export type BrandWithCharacteristic = Brand & { characteristic: Characteristic[] };
export type NewBrand = typeof brand.$inferInsert;

export type Characteristic = typeof characteristic.$inferSelect;
export type NewCharacteristic = typeof characteristic.$inferInsert;