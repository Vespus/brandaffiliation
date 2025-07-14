import {
    aiModels,
    aiProviders,
    aiSettingsDefault,
    brands,
    brandScales,
    brandWithScales, categories,
    characteristics, combinations,
    datasources,
    datasourceValues,
    scales, tasks,
    translations
} from "@/db/schema";

export type Brand = typeof brands.$inferSelect;
export type BrandWithCharacteristicAndScales = typeof brandWithScales.$inferSelect

export type Scale = typeof scales.$inferSelect
export type BrandScale = typeof brandScales.$inferSelect

export type Characteristic = typeof characteristics.$inferSelect;

export type AIProvider = typeof aiProviders.$inferSelect
export type AISetting = typeof aiSettingsDefault.$inferSelect
export type AIModel = typeof aiModels.$inferSelect
export type AIModelWithProvider = AIModel & { provider: AIProvider }
export type AIModelWithProviderAndSettings = AIModelWithProvider & { settings: AISetting }

export type Translation = typeof translations.$inferSelect

export type Datasource = typeof datasources.$inferSelect
export type DatasourceValue = typeof datasourceValues.$inferSelect
export type DatasourceWithValues = Datasource & { values: DatasourceValue[] }

export type Category = typeof categories.$inferSelect
export type Combination = typeof combinations.$inferSelect
export type Task = typeof tasks.$inferSelect