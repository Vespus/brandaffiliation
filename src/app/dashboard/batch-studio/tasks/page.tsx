import { and, eq, or, sql } from 'drizzle-orm'
import { TaskController } from '@/app/dashboard/batch-studio/tasks/task-controller'
import { TaskJoin } from '@/app/dashboard/batch-studio/tasks/type'
import { db } from '@/db'
import { brands, brandsStores, categories, categoriesStores, combinations, tasks } from '@/db/schema'
import { cookies } from 'next/headers'

export default async function Tasks() {
    const cookie = await cookies()
    const storeId = cookie.get('qs-pay-store-id')?.value!

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
            categoriesStores,
            and(
                or(eq(tasks.entityType, 'combination'), eq(tasks.entityType, 'category')),
                or(
                    eq(categoriesStores.integrationId, tasks.entityId),
                    eq(categoriesStores.integrationId, combinations.categoryId)
                )
            )
        )
        .leftJoin(
            brandsStores,
            and(
                or(eq(tasks.entityType, 'combination'), eq(tasks.entityType, 'brand')),
                or(eq(brandsStores.integrationId, tasks.entityId), eq(brandsStores.integrationId, combinations.brandId))
            )
        )
        .leftJoin(brands, eq(brands.id, brandsStores.brandId))
        .leftJoin(categories, eq(categories.id, categoriesStores.categoryId))
        .where(eq(tasks.storeId, storeId))

    return (
        <div>
            <TaskController tasks={tasksResult as TaskJoin[]} />
        </div>
    )
}
