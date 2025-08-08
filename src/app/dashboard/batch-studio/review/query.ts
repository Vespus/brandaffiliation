import { cache } from 'react'

import { cookies } from 'next/headers'

import { and, eq, or, sql } from 'drizzle-orm'
import { ReviewJoin, ReviewJoinWithContent } from '@/app/dashboard/batch-studio/tasks/type'
import { db } from '@/db'
import { brands, brandsStores, categories, categoriesStores, combinations, contents, reviews } from '@/db/schema'

export const getReviewTasks = cache(async () => {
    const cookie = await cookies()
    const storeId = cookie.get('qs-pay-store-id')?.value!

    const reviewContents = await db
        .select({
            review: reviews,
            entityName: sql`COALESCE(${combinations.name},${categories.name},${brands.name})`.as('entityName'),
            brand: brands,
            category: categories,
            combination: combinations,
        })
        .from(reviews)
        .leftJoin(
            combinations,
            and(eq(combinations.integrationId, reviews.entityId), eq(reviews.entityType, 'combination'))
        )
        .leftJoin(
            categoriesStores,
            and(
                or(eq(reviews.entityType, 'combination'), eq(reviews.entityType, 'category')),
                or(
                    eq(categoriesStores.integrationId, reviews.entityId),
                    eq(categoriesStores.integrationId, combinations.categoryId)
                )
            )
        )
        .leftJoin(
            brandsStores,
            and(
                or(eq(reviews.entityType, 'combination'), eq(reviews.entityType, 'brand')),
                or(
                    eq(brandsStores.integrationId, reviews.entityId),
                    eq(brandsStores.integrationId, combinations.brandId)
                )
            )
        )
        .leftJoin(brands, eq(brands.id, brandsStores.brandId))
        .leftJoin(categories, eq(categories.id, categoriesStores.categoryId))
        .where(and(eq(reviews.approved, false), eq(reviews.storeId, storeId)))
        .groupBy(reviews.id, brands.name, categories.name, combinations.name, brands.id, categories.id, combinations.id)

    return reviewContents as ReviewJoin[]
})

export const getReviewTask = cache(async (id: string) => {
    const cookie = await cookies()
    const storeId = cookie.get('qs-pay-store-id')?.value!

    const [reviewContent] = await db
        .select({
            review: reviews,
            content: contents,
            entityName: sql`COALESCE(${brands.name},${categories.name},${combinations.name})`.as('entityName'),
            brand: brands,
            category: categories,
            combination: combinations,
        })
        .from(reviews)
        .leftJoin(
            combinations,
            and(eq(combinations.integrationId, reviews.entityId), eq(reviews.entityType, 'combination'))
        )
        .leftJoin(
            categoriesStores,
            and(
                or(eq(reviews.entityType, 'combination'), eq(reviews.entityType, 'category')),
                or(
                    eq(categoriesStores.integrationId, reviews.entityId),
                    eq(categoriesStores.integrationId, combinations.categoryId)
                )
            )
        )
        .leftJoin(
            brandsStores,
            and(
                or(eq(reviews.entityType, 'combination'), eq(reviews.entityType, 'brand')),
                or(
                    eq(brandsStores.integrationId, reviews.entityId),
                    eq(brandsStores.integrationId, combinations.brandId)
                )
            )
        )
        .leftJoin(brands, eq(brands.id, brandsStores.brandId))
        .leftJoin(categories, eq(categories.id, categoriesStores.categoryId))
        .leftJoin(contents, and(eq(contents.entityId, reviews.entityId), eq(reviews.entityType, reviews.entityType)))
        .where(and(eq(reviews.approved, false), eq(reviews.storeId, storeId), eq(reviews.id, Number(id))))

    return reviewContent as ReviewJoinWithContent
})
