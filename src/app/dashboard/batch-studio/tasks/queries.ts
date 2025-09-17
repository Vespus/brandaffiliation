import { cookies } from 'next/headers'

import { and, asc, count, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm'
import { createSearchParamsCache, parseAsArrayOf, parseAsInteger, parseAsString } from 'nuqs/server'
import { z } from 'zod'
import { TaskJoin } from '@/app/dashboard/batch-studio/tasks/type'
import { db } from '@/db'
import { brands, brandsStores, categories, categoriesStores, combinations, tasks } from '@/db/schema'
import { getSortingStateParser } from '@/lib/datatable/parsers'

export const searchParamsCache = createSearchParamsCache({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    sort: getSortingStateParser<TaskJoin>().withDefault([{ id: 'id', desc: false }]),
    name: parseAsString,
    type: parseAsArrayOf(z.enum(['brand', 'category', 'combination'])).withDefault([]),
})

export const getTasks = async (input: Awaited<ReturnType<typeof searchParamsCache.parse>>) => {
    const cookie = await cookies()
    const storeId = cookie.get('qs-pay-store-id')?.value!
    const offset = (input.page - 1) * input.perPage

    const searchTerms = input.name
        ? input.name
              .split(/\s+/)
              .filter(Boolean)
        : []

    const searchConditions = searchTerms.map((term) =>
        or(
            ilike(combinations.name, `%${term}%`),
            ilike(categories.description, `%${term}%`),
            ilike(brands.name, `%${term}%`)
        )
    )

    const where = and(
        searchConditions.length > 0 ? and(...searchConditions) : undefined,
        eq(tasks.storeId, storeId),
        input.type.length > 0 ? inArray(tasks.entityType, input.type) : undefined
    )
    const orderBy =
        input.sort.length > 0
            ? input.sort.map((item) => (item.desc ? desc(tasks[item.id]) : asc(tasks[item.id])))
            : [asc(tasks.createdAt)]

    const [data, total] = await Promise.all([
        db
            .select({
                id: tasks.id,
                task: tasks,
                entityName: sql<string>`COALESCE(${brands.name},${categories.name},${combinations.name})`.as(
                    'entityName'
                ),
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
            .limit(input.perPage)
            .offset(offset)
            .where(where)
            .orderBy(...orderBy),
        db
            .select({ count: count() })
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
            .where(where)
            .execute()
            .then((res) => res[0]?.count ?? 0),
    ])

    return { data: data as TaskJoin[], total, pageCount: Math.ceil(total / input.perPage) }
}
