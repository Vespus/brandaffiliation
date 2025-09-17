import { Brand, Category, Combination, Content, Review, Task } from '@/db/types'

export type TaskJoin = {
    id: number
    task: Task
    brand: Brand
    category: Category
    combination: Combination
    entityName: string
}

export type ReviewJoin = {
    brand: Brand
    category: Category
    combination: Combination
    entityName: string
    review: Review
}

export type ReviewJoinWithContent = ReviewJoin & {
    content?: Content
}
