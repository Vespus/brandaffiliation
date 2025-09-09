import { cookies } from 'next/headers'

import { and, asc, count, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm'
import { createSearchParamsCache, parseAsArrayOf, parseAsInteger, parseAsString } from 'nuqs/server'
import { z } from 'zod'
import { LogTableType } from '@/app/dashboard/logs/log-table-type'
import { db } from '@/db'
import { brands, brandsStores, categories, categoriesStores, combinations, reviews } from '@/db/schema'
import { getSortingStateParser } from '@/lib/datatable/parsers'

export const searchParamsCache = createSearchParamsCache({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    sort: getSortingStateParser<LogTableType>().withDefault([{ id: 'createdAt', desc: true }]),
    name: parseAsString.withDefault(''),
    entityType: parseAsArrayOf(z.coerce.string()).withDefault([]),
})

export const getLogs = async (input: Awaited<ReturnType<typeof searchParamsCache.parse>>) => {
    const cookie = await cookies()
    const storeId = cookie.get('qs-pay-store-id')?.value!
    const offset = (input.page - 1) * input.perPage

    const searchTerms = input.name
        ? input.name
              .split(/\s+/) // split by space
              .filter(Boolean) // remove empty strings
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
        and(eq(reviews.approved, true), eq(reviews.storeId, storeId)),
        input.entityType.length > 0 ? inArray(reviews.entityType, input.entityType) : undefined
    )

    const orderBy =
        input.sort.length > 0
            ? input.sort.map((item) => (item.desc ? desc(reviews[item.id]) : asc(reviews[item.id])))
            : [desc(reviews.createdAt)]

    const [data, total] = await Promise.all([
        db
            .select({
                entityName: sql`COALESCE(${brands.name},${categories.description},${combinations.name})`.as(
                    'entityName'
                ),
                id: reviews.id,
                createdAt: reviews.createdAt,
                approvedAt: reviews.approvedAt,
                token: reviews.usage,
                review: reviews,
                brand: brands,
                category: categories,
                combination: combinations,
            })
            .from(reviews)
            .leftJoin(
                combinations,
                and(
                    eq(reviews.entityType, 'combination'),
                    eq(reviews.entityId, combinations.integrationId),
                    eq(combinations.storeId, reviews.storeId)
                )
            )
            .leftJoin(
                categoriesStores,
                and(
                    eq(categoriesStores.storeId, reviews.storeId),
                    or(
                        and(eq(reviews.entityType, 'category'), eq(categoriesStores.integrationId, reviews.entityId)),
                        and(
                            eq(reviews.entityType, 'combination'),
                            eq(categoriesStores.integrationId, combinations.categoryId)
                        )
                    )
                )
            )
            .leftJoin(
                brandsStores,
                and(
                    eq(brandsStores.storeId, reviews.storeId),
                    or(
                        and(eq(reviews.entityType, 'brand'), eq(brandsStores.integrationId, reviews.entityId)),
                        and(eq(reviews.entityType, 'combination'), eq(brandsStores.integrationId, combinations.brandId))
                    )
                )
            )
            .leftJoin(brands, eq(brands.id, brandsStores.brandId))
            .leftJoin(categories, eq(categories.id, categoriesStores.categoryId))
            .where(where)
            .orderBy(...orderBy)
            .offset(offset)
            .limit(input.perPage),
        db
            .select({
                count: count(),
            })
            .from(reviews)
            .leftJoin(
                combinations,
                and(
                    eq(reviews.entityType, 'combination'),
                    eq(reviews.entityId, combinations.integrationId),
                    eq(combinations.storeId, reviews.storeId)
                )
            )
            .leftJoin(
                categoriesStores,
                and(
                    eq(categoriesStores.storeId, reviews.storeId),
                    or(
                        and(eq(reviews.entityType, 'category'), eq(categoriesStores.integrationId, reviews.entityId)),
                        and(
                            eq(reviews.entityType, 'combination'),
                            eq(categoriesStores.integrationId, combinations.categoryId)
                        )
                    )
                )
            )
            .leftJoin(
                brandsStores,
                and(
                    eq(brandsStores.storeId, reviews.storeId),
                    or(
                        and(eq(reviews.entityType, 'brand'), eq(brandsStores.integrationId, reviews.entityId)),
                        and(eq(reviews.entityType, 'combination'), eq(brandsStores.integrationId, combinations.brandId))
                    )
                )
            )
            .leftJoin(brands, eq(brands.id, brandsStores.brandId))
            .leftJoin(categories, eq(categories.id, categoriesStores.categoryId))
            .where(where)
            .execute()
            .then((res) => res[0]?.count ?? 0),
    ])
    console.log(data)
    const pageCount = Math.ceil(total / input.perPage)
    return { data: data as unknown as LogTableType[], pageCount, total }
}
