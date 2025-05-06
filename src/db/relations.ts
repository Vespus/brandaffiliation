import {relations} from "drizzle-orm/relations";
import {aiModels, brand, brandScales, characteristic, provider, scales} from "./schema";

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

export const brandScalesRelations = relations(brandScales, ({one}) => ({
    brand: one(brand, {
        fields: [brandScales.brandId],
        references: [brand.id]
    }),
    scale: one(scales, {
        fields: [brandScales.scaleId],
        references: [scales.id]
    }),
}))

export const providerRelations = relations(provider, ({many}) => ({
    aiModels: many(aiModels),
}))

export const aiModelsRelations = relations(aiModels, ({one}) => ({
    provider: one(provider, {
        fields: [aiModels.providerId],
        references: [provider.id]
    })
}))