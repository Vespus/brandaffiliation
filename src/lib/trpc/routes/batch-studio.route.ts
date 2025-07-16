import {createTRPCRouter, publicProcedure} from "@/lib/trpc/trpc";
import {z} from "zod";
import {
    brands,
    brandWithScales,
    categories,
    combinations,
    contents,
    datasources,
    datasourceValues,
    systemPrompts,
    tasks
} from "@/db/schema";
import {and, eq, inArray, isNull, sql} from "drizzle-orm";
import {db} from "@/db";
import {getAIModelsWithProviderAndSettings} from "@/db/presets";
import {BatchContentGenerateSchemaType} from "@/app/dashboard/batch-studio/schema";
import {getDriver} from "@/app/dashboard/content-generation/utils";
import {generateObject} from "ai";
import {MetaOutputSchema} from "@/app/dashboard/content-generation/types";
import {revalidatePath} from "next/cache";

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
        .input(z.number())
        .mutation(async ({input}) => {

        })
})

