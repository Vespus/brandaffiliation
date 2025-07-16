import {Brand, Category, Combination, Content, Task} from "@/db/types";

export type TaskJoin = {
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
    content: Content
}