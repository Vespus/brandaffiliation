import {createTRPCRouter, publicProcedure} from "@/lib/trpc/trpc";
import {z} from "zod";
import {brands, combinations, contents} from "@/db/schema";
import {and, eq, isNull, sql} from "drizzle-orm";
import {db} from "@/db";

export const batchStudioRoute = createTRPCRouter({
    getAllBrands: publicProcedure
        .query(async () => {
            const data = await db.select({
                name: brands.name,
                slug: brands.slug,
                content: contents.config,
                integrationId: brands.integrationId,
                hasContent: sql<boolean>`(${contents.config} IS NOT NULL)`.as('hasContent'),
            })
                .from(brands)
                .leftJoin(contents, and(eq(contents.entityId, brands.integrationId), eq(contents.entityType, "brand")))

            return data
        }),
    getAllBrandsWithNoContent: publicProcedure
        .query(async () => {
            const data = await db.select({
                name: brands.name,
                slug: brands.slug,
                content: contents.config,
                integrationId: brands.integrationId,
                hasContent: sql<boolean>`(${contents.config} IS NOT NULL)`.as('hasContent'),
            })
                .from(brands)
                .leftJoin(contents, and(eq(contents.entityId, brands.integrationId), eq(contents.entityType, "brand")))
                .where(isNull(contents.config))
            return data
        }),
    getAllCombinations: publicProcedure
        .query(async () => {
            const data = await db.select({
                name: combinations.name,
                description: combinations.description,
                content: contents.config,
                integrationId: combinations.integrationId,
                hasContent: sql<boolean>`(${contents.config} IS NOT NULL)`.as('hasContent'),
            })
                .from(combinations)
                .leftJoin(contents, and(eq(contents.entityId, combinations.integrationId), eq(contents.entityType, "combination")))

            return data
        }),
    getAllCombinationsWithNoContent: publicProcedure
        .query(async () => {
            const data = await db.select({
                name: combinations.name,
                description: combinations.description,
                content: contents.config,
                integrationId: combinations.integrationId,
                hasContent: sql<boolean>`(${contents.config} IS NOT NULL)`.as('hasContent'),
            })
                .from(combinations)
                .leftJoin(contents, and(eq(contents.entityId, combinations.integrationId), eq(contents.entityType, "combination")))
                .where(isNull(contents.config))

            return data
        }),
    process: publicProcedure
        .input(
            z.any()
        )
        .mutation(async ({input}) => {
            //simulate sleep
            await new Promise(resolve => setTimeout(resolve, 2000))
            return input
        })
})
