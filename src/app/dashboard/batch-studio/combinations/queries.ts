import { and, asc, count, desc, eq, ilike, isNotNull, isNull, or, sql } from 'drizzle-orm'
import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server'
import { BatchStudioCombinationType } from '@/app/dashboard/batch-studio/combinations/batch-studio-combination-type'
import { db } from '@/db'
import { brands, categories, combinations, contents } from '@/db/schema'
import { BrandWithCharacteristicAndScales } from '@/db/types'
import { getSortingStateParser } from '@/lib/datatable/parsers'

export const searchParamsCache = createSearchParamsCache({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    sort: getSortingStateParser<BrandWithCharacteristicAndScales>().withDefault([{ id: 'name', desc: false }]),
    name: parseAsString.withDefault(''),
    content: parseAsString,
})

export const getCombinations = async (input: Awaited<ReturnType<typeof searchParamsCache.parse>>) => {
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
        isNotNull(combinations.integrationId)
    )

    const orderBy =
        input.sort.length > 0
            ? input.sort.map((item) => (item.desc ? desc(combinations[item.id]) : asc(combinations[item.id])))
            : [asc(combinations.name)]

    const data = (await db
        .select({
            name: combinations.name,
            id: combinations.id,
            description: combinations.description,
            content: contents.config,
            integrationId: combinations.integrationId,
            hasContent: sql<boolean>`(${contents.config} IS NOT NULL)`.as('hasContent'),
            brand: brands.name,
            brandSlug: brands.slug,
            category: categories.description,
            categorySlug: categories.slug,
        })
        .from(combinations)
        .leftJoin(
            contents,
            and(eq(contents.entityId, combinations.integrationId), eq(contents.entityType, 'combination'))
        )
        .leftJoin(brands, and(eq(combinations.brandId, brands.integrationId)))
        .leftJoin(categories, and(eq(combinations.categoryId, categories.integrationId)))
        .where(where)
        .orderBy(...orderBy)
        .offset(offset)
        .limit(input.perPage)) as unknown as BatchStudioCombinationType[]

    const total = await db
        .select({
            count: count(),
        })
        .from(combinations)
        .leftJoin(
            contents,
            and(eq(contents.entityId, combinations.integrationId), eq(contents.entityType, 'combination'))
        )
        .leftJoin(brands, and(eq(combinations.brandId, brands.integrationId)))
        .leftJoin(categories, and(eq(combinations.categoryId, categories.integrationId)))
        .where(where)
        .execute()
        .then((res) => res[0]?.count ?? 0)

    const pageCount = Math.ceil(total / input.perPage)
    return { data, pageCount, total }
}
