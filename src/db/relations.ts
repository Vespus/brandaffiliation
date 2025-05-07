import {relations} from "drizzle-orm/relations";
import {aiModels, brands, brandScales, characteristic, provider, scales} from "./schema";

export const characteristicRelations = relations(characteristic, ({one}) => ({
    brand: one(brands, {
        fields: [characteristic.brandId],
        references: [brands.id]
    }),
}));

export const brandRelations = relations(brands, ({many}) => ({
    characteristic: many(characteristic),
    brandScales: many(brandScales)
}));

export const brandScalesRelations = relations(brandScales, ({one}) => ({
    brand: one(brands, {
        fields: [brandScales.brandId],
        references: [brands.id]
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