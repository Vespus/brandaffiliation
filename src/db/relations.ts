import { relations } from "drizzle-orm/relations";
import { aiModels, aiProviders, aiSettingsUser, brands, characteristics } from "./schema";

export const aiSettingsUserRelations = relations(aiSettingsUser, ({one}) => ({
    aiModel: one(aiModels, {
        fields: [aiSettingsUser.model],
        references: [aiModels.modelName]
    }),
}));

export const aiModelsRelations = relations(aiModels, ({one, many}) => ({
    aiSettingsUsers: many(aiSettingsUser),
    aiProvider: one(aiProviders, {
        fields: [aiModels.providerId],
        references: [aiProviders.id]
    }),
}));

export const aiProvidersRelations = relations(aiProviders, ({many}) => ({
    aiModels: many(aiModels),
}));

export const characteristicsRelations = relations(characteristics, ({one}) => ({
    brand: one(brands, {
        fields: [characteristics.brandId],
        references: [brands.id]
    }),
}));

export const brandsRelations = relations(brands, ({many}) => ({
    characteristics: many(characteristics),
}));