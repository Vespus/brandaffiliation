import { relations } from "drizzle-orm/relations";
import {brand, brandScales, characteristic, scale, scaleGroups} from "./schema";

export const characteristicRelations = relations(characteristic, ({one}) => ({
	brand: one(brand, {
		fields: [characteristic.brandId],
		references: [brand.id]
	}),
}));

export const brandRelations = relations(brand, ({many}) => ({
	characteristic: many(characteristic),
	brandScales: many(brandScales)
}));

export const scaleRelations = relations(scale, ({one}) => ({
	group: one(scaleGroups, {
		fields: [scale.group_id],
		references: [scaleGroups.id]
	})
}))

export const brandScaleRelations = relations(brandScales, ({many, one}) => ({
	brand: one(brand, {
		fields: [brandScales.brandId],
		references: [brand.id]
	}),
	scale: one(scale, {
		fields: [brandScales.scaleId],
		references: [scale.id]
	}),
}));