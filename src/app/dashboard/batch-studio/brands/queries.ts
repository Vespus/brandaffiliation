import { cookies } from 'next/headers';



import { and, asc, count, desc, eq, ilike, isNotNull, isNull, or, sql } from 'drizzle-orm';
import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server';
import { BatchStudioBrandType } from '@/app/dashboard/batch-studio/brands/batch-studio-brand-type'
import { db } from '@/db'
import { brands, brandsStores, categories, categoriesStores, contents } from '@/db/schema'
import { BrandWithCharacteristicAndScales } from '@/db/types';
import { getSortingStateParser } from '@/lib/datatable/parsers';
import { BatchStudioCategoryType } from '@/app/dashboard/batch-studio/categories/batch-studio-category-type'


export const searchParamsCache = createSearchParamsCache({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    sort: getSortingStateParser<BrandWithCharacteristicAndScales>().withDefault([{ id: 'name', desc: false }]),
    name: parseAsString.withDefault(''),
    content: parseAsString,
})

export const getBrands = async (input: Awaited<ReturnType<typeof searchParamsCache.parse>>) => {
    const cookie = await cookies()
    const storeId = cookie.get('qs-pay-store-id')?.value!
    const offset = (input.page - 1) * input.perPage

    const searchTerms = input.name
        ? input.name
            .split(/\s+/) // split by space
            .filter(Boolean) // remove empty strings
        : []

    const searchConditions = searchTerms.map((term) =>
        and(ilike(brands.name, `%${term}%`))
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
        eq(brandsStores.storeId, storeId)
    )

    const orderBy =
        input.sort.length > 0
            ? input.sort.map((item) => (item.desc ? desc(brands[item.id]) : asc(brands[item.id])))
            : [asc(brands.name)]

    const { data, total } = await db.transaction(async (tx) => {
        const data = await tx
            .select({
                name: brands.name,
                slug: brands.slug,
                content: contents.config,
                integrationId: brandsStores.integrationId,
                hasContent: sql<boolean>`(${contents.config} IS NOT NULL)`.as('hasContent'),
            })
            .from(brandsStores)
            .leftJoin(brands, eq(brands.id, brandsStores.brandId))
            .leftJoin(contents, and(eq(contents.entityId, brandsStores.integrationId), eq(contents.entityType, 'brand'), eq(contents.storeId, storeId)))
            .where(where)
            .orderBy(...orderBy)
            .groupBy(brands.id, contents.config, brands.name, brandsStores.slug, brandsStores.integrationId)
            .offset(offset)
            .limit(input.perPage)

        const total = await tx
            .select({
                count: count(),
            })
            .from(brandsStores)
            .leftJoin(brands, eq(brands.id, brandsStores.brandId))
            .leftJoin(contents, and(eq(contents.entityId, brandsStores.integrationId), eq(contents.entityType, 'brand'), eq(contents.storeId, storeId)))
            .where(where)
            .execute()
            .then((res) => res[0]?.count ?? 0)

        return {
            data: data as unknown as BatchStudioBrandType[],
            total,
        }
    })

    const pageCount = Math.ceil(total / input.perPage)
    return { data, pageCount, total }
}
