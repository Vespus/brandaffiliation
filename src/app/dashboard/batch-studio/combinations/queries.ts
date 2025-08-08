import { cookies } from 'next/headers'

import { and, asc, count, desc, eq, ilike, isNotNull, isNull, or, sql } from 'drizzle-orm'
import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server'
import { BatchStudioCombinationType } from '@/app/dashboard/batch-studio/combinations/batch-studio-combination-type'
import { db } from '@/db'
import { brands, brandsStores, categories, categoriesStores, combinations, contents, reviews, tasks } from '@/db/schema'
import { getSortingStateParser } from '@/lib/datatable/parsers'

export const searchParamsCache = createSearchParamsCache({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    sort: getSortingStateParser<BatchStudioCombinationType>().withDefault([{ id: 'name', desc: false }]),
    name: parseAsString.withDefault(''),
    content: parseAsString,
})

export const getCombinations = async (input: Awaited<ReturnType<typeof searchParamsCache.parse>>) => {
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
        input.content === 'yes' ? isNotNull(contents.config) : undefined,
        input.content === 'no' ? isNull(contents.config) : undefined,
        input.content === 'missing'
            ? or(
                  sql`${contents.config}->'descriptions'->>'header' IS NULL`,
                  sql`${contents.config}->'descriptions'->>'header' = ''`,
                  sql`${contents.config}->'descriptions'->>'footer' IS NULL`,
                  sql`${contents.config}->'descriptions'->>'footer' = ''`
              )
            : undefined,
        eq(combinations.storeId, storeId),
        sql`NOT EXISTS (SELECT 1 FROM ${tasks} WHERE ${tasks.entityId} = ${combinations.integrationId} AND ${tasks.entityType} = 'combination')`,
        sql`NOT EXISTS (SELECT 1 FROM ${reviews} WHERE ${reviews.entityId} = ${combinations.integrationId} AND ${reviews.entityType} = 'combination')`
    )

    const orderBy =
        input.sort.length > 0
            ? input.sort.map((item) => {
                const sortMethod = item.desc ? desc : asc
                if (item.id === 'brand') {
                    return sortMethod(brands.name)
                } else if (item.id === 'category') {
                    return sortMethod(categories.description)
                } else if (item.id === 'name') {
                    return sortMethod(combinations.name)
                } else if (item.id === 'description') {
                    return sortMethod(combinations.description)
                } else if (item.id === 'content') {
                    return sortMethod(contents.config)
                } else if (item.id === 'hasContent') {
                    return sortMethod(contents.config)
                }

                return sortMethod(combinations.name)
            })
            : [asc(combinations.name)]

    const [data, total] = await Promise.all([
        db
            .select({
                name: combinations.name,
                id: combinations.id,
                description: combinations.description,
                content: contents.config,
                integrationId: combinations.integrationId,
                hasContent: sql<boolean>`(${contents.config} IS NOT NULL)`.as('hasContent'),
                brand: brands.name,
                brandSlug: brandsStores.slug,
                category: categories.description,
                categorySlug: categoriesStores.slug,
            })
            .from(combinations)
            .leftJoin(
                contents,
                and(eq(contents.entityId, combinations.integrationId), eq(contents.entityType, 'combination'))
            )
            .leftJoin(brandsStores, eq(combinations.brandId, brandsStores.integrationId))
            .leftJoin(categoriesStores, eq(combinations.categoryId, categoriesStores.integrationId))
            .leftJoin(brands, eq(brandsStores.brandId, brands.id))
            .leftJoin(categories, eq(categoriesStores.categoryId, categories.id))
            .where(where)
            .orderBy(...orderBy)
            .groupBy(
                combinations.id,
                contents.config,
                brands.name,
                categories.description,
                brandsStores.slug,
                categoriesStores.slug,
                combinations.name
            )
            .offset(offset)
            .limit(input.perPage),
        db
            .select({ count: count(combinations.id) })
            .from(combinations)
            .leftJoin(
                contents,
                and(eq(contents.entityId, combinations.integrationId), eq(contents.entityType, 'combination'))
            )
            .leftJoin(brandsStores, eq(combinations.brandId, brandsStores.integrationId))
            .leftJoin(categoriesStores, eq(combinations.categoryId, categoriesStores.integrationId))
            .leftJoin(brands, eq(brandsStores.brandId, brands.id))
            .leftJoin(categories, eq(categoriesStores.categoryId, categories.id))
            .where(where)
            .groupBy(combinations.id)
            .then((result) => result.length),
    ])

    const pageCount = Math.ceil(total / input.perPage)
    return { data: data as unknown as BatchStudioCombinationType[], pageCount, total }
}
