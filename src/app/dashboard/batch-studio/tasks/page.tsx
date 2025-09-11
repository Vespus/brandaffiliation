import { cookies } from 'next/headers'

import { and, eq, or, sql } from 'drizzle-orm'
import { TaskController } from '@/app/dashboard/batch-studio/tasks/task-controller'
import { TaskJoin } from '@/app/dashboard/batch-studio/tasks/type'
import { db } from '@/db'
import { brands, brandsStores, categories, categoriesStores, combinations, tasks } from '@/db/schema'

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
            and(
                eq(tasks.entityType, 'combination'),
                eq(tasks.entityId, combinations.integrationId),
                eq(combinations.storeId, tasks.storeId)
            )
        )
        .leftJoin(
            categoriesStores,
            and(
                eq(categoriesStores.storeId, tasks.storeId),
                or(
                    and(eq(tasks.entityType, 'category'), eq(categoriesStores.integrationId, tasks.entityId)),
                    and(
                        eq(tasks.entityType, 'combination'),
                        eq(categoriesStores.integrationId, combinations.categoryId)
                    )
                )
            )
        )
        .leftJoin(
            brandsStores,
            and(
                eq(brandsStores.storeId, tasks.storeId),
                or(
                    and(eq(tasks.entityType, 'brand'), eq(brandsStores.integrationId, tasks.entityId)),
                    and(eq(tasks.entityType, 'combination'), eq(brandsStores.integrationId, combinations.brandId))
                )
            )
        )
        .leftJoin(brands, eq(brands.id, brandsStores.brandId))
        .leftJoin(categories, eq(categories.id, categoriesStores.categoryId))
        .where(eq(tasks.storeId, storeId))

    return (
        <TaskController tasks={tasksResult as TaskJoin[]} />
    )
}
