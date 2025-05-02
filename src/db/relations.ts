import {relations} from "drizzle-orm/relations";
import {aiModels, brand, characteristic, provider} from "./schema";

export const characteristicRelations = relations(characteristic, ({one}) => ({
    brand: one(brand, {
        fields: [characteristic.brandId],
        references: [brand.id]
    }),
}));

export const brandRelations = relations(brand, ({many}) => ({
    characteristic: many(characteristic),
}));

export const providerRelations = relations(provider, ({many}) => ({
    aiModels: many(aiModels),
}))

export const aiModelsRelations = relations(aiModels, ({one}) => ({
    provider: one(provider, {
        fields: [aiModels.providerId],
        references: [provider.id]
    })
}))