import { cookies } from 'next/headers'

import { and, eq, isNull, or, sql } from 'drizzle-orm'
import { db } from '@/db'
import { brandsStores, categoriesStores, combinations, contents } from '@/db/schema'
import { createTRPCRouter, publicProcedure } from '@/lib/trpc/trpc'

export const batchStudioRoute = createTRPCRouter({
    getAllBrands: publicProcedure.query(async () => {
        const cookie = await cookies()
        const storeId = cookie.get('qs-pay-store-id')?.value!

        return db
            .select({
                integrationId: brandsStores.integrationId,
            })
            .from(brandsStores)
            .where(eq(brandsStores.storeId, storeId))
    }),
    getAllBrandsWithNoContent: publicProcedure.query(async () => {
        const cookie = await cookies()
        const storeId = cookie.get('qs-pay-store-id')?.value!

        return db
            .select({
                integrationId: brandsStores.integrationId,
            })
            .from(brandsStores)
            .leftJoin(
                contents,
                and(eq(contents.entityId, brandsStores.integrationId), eq(contents.entityType, 'brand'))
            )
            .where(and(isNull(contents.config), eq(brandsStores.storeId, storeId)))
    }),
    getAllBrandsWithNoTextContent: publicProcedure.query(async () => {
        const cookie = await cookies()
        const storeId = cookie.get('qs-pay-store-id')?.value!

        return db
            .select({
                integrationId: brandsStores.integrationId,
            })
            .from(brandsStores)
            .leftJoin(
                contents,
                and(eq(contents.entityId, brandsStores.integrationId), eq(contents.entityType, 'brand'))
            )
            .where(
                and(
                    eq(brandsStores.storeId, storeId),
                    or(
                        sql`${contents.config}->'descriptions'->>'header' IS NULL`,
                        sql`${contents.config}->'descriptions'->>'header' = ''`,
                        sql`${contents.config}->'descriptions'->>'footer' IS NULL`,
                        sql`${contents.config}->'descriptions'->>'footer' = ''`
                    )
                )
            )
    }),
    getAllCombinations: publicProcedure.query(async () => {
        const data = await db
            .select({
                name: combinations.name,
                description: combinations.description,
                content: contents.config,
                integrationId: combinations.integrationId,
                hasContent: sql<boolean>`(${contents.config} IS NOT NULL)`.as('hasContent'),
            })
            .from(combinations)
            .leftJoin(
                contents,
                and(eq(contents.entityId, combinations.integrationId), eq(contents.entityType, 'combination'))
            )

        return data
    }),
    getAllCombinationsWithNoContent: publicProcedure.query(async () => {
        const data = await db
            .select({
                name: combinations.name,
                description: combinations.description,
                content: contents.config,
                integrationId: combinations.integrationId,
                hasContent: sql<boolean>`(${contents.config} IS NOT NULL)`.as('hasContent'),
            })
            .from(combinations)
            .leftJoin(
                contents,
                and(eq(contents.entityId, combinations.integrationId), eq(contents.entityType, 'combination'))
            )
            .where(isNull(contents.config))

        return data
    }),
    getAllCombinationsWithNoTextContent: publicProcedure.query(async () => {
        const cookie = await cookies()
        const storeId = cookie.get('qs-pay-store-id')?.value!

        return db
            .select({
                integrationId: combinations.integrationId,
            })
            .from(combinations)
            .leftJoin(
                contents,
                and(eq(contents.entityId, combinations.integrationId), eq(contents.entityType, 'combination'))
            )
            .where(
                and(
                    eq(combinations.storeId, storeId),
                    or(
                        sql`${contents.config}->'descriptions'->>'header' IS NULL`,
                        sql`${contents.config}->'descriptions'->>'header' = ''`,
                        sql`${contents.config}->'descriptions'->>'footer' IS NULL`,
                        sql`${contents.config}->'descriptions'->>'footer' = ''`
                    )
                )
            )
    }),
    getAllCategories: publicProcedure.query(async () => {
        const cookie = await cookies()
        const storeId = cookie.get('qs-pay-store-id')?.value!

        return db
            .select({
                integrationId: categoriesStores.integrationId,
            })
            .from(categoriesStores)
            .where(eq(categoriesStores.storeId, storeId))
    }),
    getAllCategoriesWithNoContent: publicProcedure.query(async () => {
        const cookie = await cookies()
        const storeId = cookie.get('qs-pay-store-id')?.value!

        return db
            .select({
                integrationId: categoriesStores.integrationId,
            })
            .from(categoriesStores)
            .leftJoin(
                contents,
                and(eq(contents.entityId, categoriesStores.integrationId), eq(contents.entityType, 'category'))
            )
            .where(and(isNull(contents.config), eq(categoriesStores.storeId, storeId)))
    }),
    getAllCategoriesWithNoTextContent: publicProcedure.query(async () => {
        const cookie = await cookies()
        const storeId = cookie.get('qs-pay-store-id')?.value!

        return db
            .select({
                integrationId: categoriesStores.integrationId,
            })
            .from(categoriesStores)
            .leftJoin(
                contents,
                and(eq(contents.entityId, categoriesStores.integrationId), eq(contents.entityType, 'category'))
            )
            .where(
                and(
                    eq(categoriesStores.storeId, storeId),
                    or(
                        sql`${contents.config}->'descriptions'->>'header' IS NULL`,
                        sql`${contents.config}->'descriptions'->>'header' = ''`,
                        sql`${contents.config}->'descriptions'->>'footer' IS NULL`,
                        sql`${contents.config}->'descriptions'->>'footer' = ''`
                    )
                )
            )
    }),
})
