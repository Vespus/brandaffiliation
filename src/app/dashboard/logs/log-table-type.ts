import { Brand, Category, Combination, Review } from '@/db/types'
import { LanguageModelV2Usage } from '@ai-sdk/provider'

export type LogTableType = {
    id: string
    entityName: string
    createdAt: string
    approvedAt: string
    token: LanguageModelV2Usage
    category: Category
    review: Review,
    brand: Brand,
    combination: Combination
}
