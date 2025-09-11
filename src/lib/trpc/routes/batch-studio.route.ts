import { cookies } from 'next/headers'

import { and, eq, isNull, or, sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db'
import { brandsStores, categoriesStores, combinations, contents, reviews } from '@/db/schema'
import { SoftHttpError } from '@/lib/soft-http-error'
import { createTRPCRouter, publicProcedure } from '@/lib/trpc/trpc'

export const batchStudioRoute = createTRPCRouter({
    selection: publicProcedure
        .input(
            z.object({
                type: z.enum(['brand', 'combination', 'category']),
                subType: z.enum(['all', 'no-content', 'no-text-content', 'no-processed']),
            })
        )
        .query(async ({ input }) => {
            const cookie = await cookies()
            const storeId = cookie.get('qs-pay-store-id')?.value

            if (!storeId) {
                throw new SoftHttpError(
                    'Store ID not found. Please try again. If the problem persists, please contact support.'
                )
            }

            const result = await selectionQueries[input.type][input.subType]({ storeId })
            return result.map((x) => x.integrationId)
        }),
})

const selectionQueries = {
    brand: {
        all: async ({ storeId }: { storeId: string }) => {
            return db
                .select({
                    integrationId: brandsStores.integrationId,
                })
                .from(brandsStores)
                .where(eq(brandsStores.storeId, storeId))
        },
        'no-content': async ({ storeId }: { storeId: string }) => {
            return db
                .select({
                    integrationId: brandsStores.integrationId,
                })
                .from(brandsStores)
                .leftJoin(
                    contents,
                    and(
                        eq(contents.entityId, brandsStores.integrationId),
                        eq(contents.entityType, 'brand'),
                        eq(contents.storeId, brandsStores.storeId)
                    )
                )
                .where(and(isNull(contents.config), eq(brandsStores.storeId, storeId)))
        },
        'no-text-content': async ({ storeId }: { storeId: string }) => {
            return db
                .select({
                    integrationId: brandsStores.integrationId,
                })
                .from(brandsStores)
                .leftJoin(
                    contents,
                    and(
                        eq(contents.entityId, brandsStores.integrationId),
                        eq(contents.entityType, 'brand'),
                        eq(contents.storeId, brandsStores.storeId)
                    )
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
        },
        'no-processed': async ({ storeId }: { storeId: string }) => {
            return db
                .select({
                    integrationId: brandsStores.integrationId,
                })
                .from(brandsStores)
                .leftJoin(
                    reviews,
                    and(
                        eq(reviews.entityId, brandsStores.integrationId),
                        eq(reviews.storeId, brandsStores.storeId),
                        eq(reviews.entityType, 'brand')
                    )
                )
                .where(and(eq(brandsStores.storeId, storeId), isNull(reviews.entityId)))
        },
    },
    category: {
        all: async ({ storeId }: { storeId: string }) => {
            return db
                .select({
                    integrationId: categoriesStores.integrationId,
                })
                .from(categoriesStores)
                .where(eq(categoriesStores.storeId, storeId))
        },
        'no-content': async ({ storeId }: { storeId: string }) => {
            return db
                .select({
                    integrationId: categoriesStores.integrationId,
                })
                .from(categoriesStores)
                .leftJoin(
                    contents,
                    and(
                        eq(contents.entityId, categoriesStores.integrationId),
                        eq(contents.storeId, categoriesStores.storeId),
                        eq(contents.entityType, 'category')
                    )
                )
                .where(and(isNull(contents.config), eq(categoriesStores.storeId, storeId)))
        },
        'no-text-content': async ({ storeId }: { storeId: string }) => {
            return db
                .select({
                    integrationId: categoriesStores.integrationId,
                })
                .from(categoriesStores)
                .leftJoin(
                    contents,
                    and(
                        eq(contents.entityId, categoriesStores.integrationId),
                        eq(contents.storeId, categoriesStores.storeId),
                        eq(contents.entityType, 'category')
                    )
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
        },
        'no-processed': async ({ storeId }: { storeId: string }) => {
            return db
                .select({
                    integrationId: brandsStores.integrationId,
                })
                .from(categoriesStores)
                .leftJoin(
                    reviews,
                    and(
                        eq(reviews.entityId, categoriesStores.integrationId),
                        eq(reviews.storeId, categoriesStores.storeId),
                        eq(reviews.entityType, 'brand')
                    )
                )
                .where(and(eq(categoriesStores.storeId, storeId), isNull(reviews.entityId)))
        },
    },
    combination: {
        all: async ({ storeId }: { storeId: string }) => {
            return db
                .select({
                    integrationId: combinations.integrationId,
                })
                .from(combinations)
                .leftJoin(
                    contents,
                    and(
                        eq(contents.entityId, combinations.integrationId),
                        eq(contents.storeId, combinations.storeId),
                        eq(contents.entityType, 'combination')
                    )
                )
                .where(eq(combinations.storeId, storeId))
        },
        'no-content': async ({ storeId }: { storeId: string }) => {
            return db
                .select({
                    integrationId: combinations.integrationId,
                })
                .from(combinations)
                .leftJoin(
                    contents,
                    and(
                        eq(contents.entityId, combinations.integrationId),
                        eq(contents.storeId, combinations.storeId),
                        eq(contents.entityType, 'combination')
                    )
                )
                .where(isNull(contents.config))
        },
        'no-text-content': async ({ storeId }: { storeId: string }) => {
            return db
                .select({
                    integrationId: combinations.integrationId,
                })
                .from(combinations)
                .leftJoin(
                    contents,
                    and(
                        eq(contents.entityId, combinations.integrationId),
                        eq(contents.storeId, combinations.storeId),
                        eq(contents.entityType, 'combination')
                    )
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
        },
        'no-processed': async ({ storeId }: { storeId: string }) => {
            return db
                .select({
                    integrationId: combinations.integrationId,
                })
                .from(combinations)
                .leftJoin(
                    reviews,
                    and(
                        eq(reviews.entityId, combinations.integrationId),
                        eq(reviews.storeId, combinations.storeId),
                        eq(reviews.entityType, 'combination')
                    )
                )
                .where(and(eq(combinations.storeId, storeId), isNull(reviews.entityId)))
        },
    },
}

export type SelectionQuery = 'brand' | 'category' | 'combination'
export type SelectionSubQuery = 'all' | 'no-content' | 'no-text-content' | 'no-processed'
