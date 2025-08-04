import {
    aiModels,
    aiProviders,
    aiSettingsDefault,
    brandScales,
    brandWithScales,
    brands,
    categories,
    characteristics,
    combinations,
    contents,
    datasourceValues,
    datasources,
    scales,
    tasks,
    translations, reviews,
} from '@/db/schema'

export type Brand = typeof brands.$inferSelect
export type BrandWithCharacteristicAndScales = typeof brandWithScales.$inferSelect

export type Scale = typeof scales.$inferSelect
export type BrandScale = typeof brandScales.$inferSelect

export type Characteristic = typeof characteristics.$inferSelect

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
export type Content = typeof contents.$inferSelect
export type Review = typeof reviews.$inferSelect
