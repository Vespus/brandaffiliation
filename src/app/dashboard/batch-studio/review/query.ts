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
        .leftJoin(
            contents,
            and(
                eq(contents.entityId, reviews.entityId),
                eq(contents.entityType, reviews.entityType),
                eq(contents.storeId, reviews.storeId)
            )
        )
        .where(and(eq(reviews.approved, false), eq(reviews.storeId, storeId), eq(reviews.id, Number(id))))

    return reviewContent as ReviewJoinWithContent
})
