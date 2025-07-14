import {Brand, Category, Combination, Task} from "@/db/types";

export type TaskJoin = {
    task: Task
    brand: Brand
    category: Category
    combination: Combination
    entityName: string
}