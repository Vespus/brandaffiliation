import { relations } from "drizzle-orm/relations";
import {brand, characteristic} from "./schema";

export const characteristicRelations = relations(characteristic, ({one}) => ({
	brand: one(brand, {
		fields: [characteristic.brandId],
		references: [brand.id]
	}),
}));

export const brandRelations = relations(brand, ({many}) => ({
	characteristic: many(characteristic),
}));
