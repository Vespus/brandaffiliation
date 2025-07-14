import {Brand, Category, Combination, Task} from "@/db/types";

export type TaskJoin = {
    tasks: Task
    brands: Brand
    categories: Category
    combinations: Combination
}