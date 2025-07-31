import { and, eq, or, sql } from 'drizzle-orm'
import { TaskController } from '@/app/dashboard/batch-studio/tasks/task-controller'
import { TaskJoin } from '@/app/dashboard/batch-studio/tasks/type'
import { db } from '@/db'
import { brands, categories, combinations, tasks } from '@/db/schema'

export default async function Tasks() {
    const tasksResult = await db
        .select({
            task: tasks,
            entityName: sql`COALESCE(${brands.name},${categories.name},${combinations.name})`.as('entityName'),
            brand: brands,
            category: categories,
            combination: combinations,
        })
        .from(tasks)
        .leftJoin(
            combinations,
            and(eq(tasks.entityType, 'combination'), eq(tasks.entityId, combinations.integrationId))
        )
        .leftJoin(
            categories,
            and(
                or(eq(tasks.entityType, 'combination'), eq(tasks.entityType, 'category')),
                or(eq(tasks.entityId, categories.integrationId), eq(categories.integrationId, combinations.categoryId))
            )
        )
        .leftJoin(
            brands,
            and(or(eq(tasks.entityId, brands.integrationId), eq(brands.integrationId, combinations.brandId)))
        )

    return (
        <div>
            <TaskController tasks={tasksResult as TaskJoin[]} />
        </div>
    )
}
