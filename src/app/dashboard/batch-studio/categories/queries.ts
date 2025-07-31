import { and, asc, count, desc, eq, ilike, isNotNull, isNull, or, sql } from 'drizzle-orm'
import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server'
import { BatchStudioCategoryType } from '@/app/dashboard/batch-studio/categories/batch-studio-category-type'
import { db } from '@/db'
import { categories, contents } from '@/db/schema'
import { Category } from '@/db/types'
import { getSortingStateParser } from '@/lib/datatable/parsers'

export const searchParamsCache = createSearchParamsCache({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    sort: getSortingStateParser<Category>().withDefault([{ id: 'description', desc: false }]),
    description: parseAsString.withDefault(''),
    content: parseAsString,
})

export const getCategories = async (input: Awaited<ReturnType<typeof searchParamsCache.parse>>) => {
    const offset = (input.page - 1) * input.perPage

    const searchTerms = input.description
        ? input.description
              .split(/\s+/) // split by space
              .filter(Boolean) // remove empty strings
        : []

    const searchConditions = searchTerms.map((term) =>
        or(ilike(categories.name, `%${term}%`), ilike(categories.description, `%${term}%`))
    )

    const where = and(
        searchConditions.length > 0 ? and(...searchConditions) : undefined,
        input.content === 'yes' ? isNotNull(contents.config) : undefined,
        input.content === 'no' ? isNull(contents.config) : undefined,
        isNotNull(categories.integrationId)
    )

    const orderBy =
        input.sort.length > 0
            ? input.sort.map((item) => (item.desc ? desc(categories[item.id]) : asc(categories[item.id])))
            : [asc(categories.description)]

    const { data, total } = await db.transaction(async (tx) => {
        const data = await tx
            .select({
                name: categories.name,
                description: categories.description,
                slug: categories.slug,
                content: contents.config,
                integrationId: categories.integrationId,
                hasContent: sql<boolean>`(${contents.config} IS NOT NULL)`.as('hasContent'),
            })
            .from(categories)
            .leftJoin(
                contents,
                and(eq(contents.entityId, categories.integrationId), eq(contents.entityType, 'category'))
            )
            .where(where)
            .orderBy(...orderBy)
            .offset(offset)
            .limit(input.perPage)

        const total = await tx
            .select({
                count: count(),
            })
            .from(categories)
            .leftJoin(
                contents,
                and(eq(contents.entityId, categories.integrationId), eq(contents.entityType, 'category'))
            )
            .where(where)
            .execute()
            .then((res) => res[0]?.count ?? 0)

        return {
            data: data as unknown as BatchStudioCategoryType[],
            total,
        }
    })

    const pageCount = Math.ceil(total / input.perPage)
    return { data, pageCount, total }
}
