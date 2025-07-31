import { formatPrompt } from "@/app/dashboard/content-generation/utils";
import { getDatasourceById } from "@/app/dashboard/datasources/queries";
import { db } from "@/db";
import {
    aiModels,
    brands as brandTable,
    brandWithScales,
    datasources,
    datasourceValues,
    translations,
    userPrompts
} from "@/db/schema";
import { getUser } from "@/lib/get-user";
import { SoftHttpError } from "@/lib/soft-http-error";
import { createTRPCRouter, publicProcedure } from "@/lib/trpc/trpc";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const genericRoute = createTRPCRouter({
    getBrandsWithCharacteristics: publicProcedure
        .query(async () => {
            return db.query.brands.findMany({
                with: {
                    characteristics: true
                }
            });
        }),
    getCategories: publicProcedure
        .query(async () => {
            return await import("@/categories.json").then(x => x.categories)
        }),
    getAIModels: publicProcedure
        .query(async () => {
            return db.query.aiModels.findMany({
                where: (
                    eq(aiModels.isActive, true)
                ),
                with: {
                    aiProvider: {
                        columns: {
                            name: true,
                            code: true
                        }
                    }
                }
            });
        }),
    getPrompt: publicProcedure
        .input(z.object({
            brand: z.number(),
            season: z.string(),
            category: z.string(),
            prompt: z.string(),
        }))
        .query(async ({input}) => {
            const [brand] = await db.select()
                .from(brandWithScales)
                .where(eq(brandTable.id, input.brand))

            if (!brand) {
                throw new SoftHttpError("Brand not found")
            }

            return formatPrompt({
                category: input.category,
                season: input.season,
                brand: brand,
                prompt: input.prompt
            })
        }),
    getUserPrompts: publicProcedure
        .query(async () => {
            const {user} = await getUser()

            if (!user) {
                throw new SoftHttpError("User not found")
            }

            return db.query.userPrompts.findMany({where: eq(userPrompts.userId, user!.id)});
        }),
    getTranslationById: publicProcedure
        .input(z.object({id: z.number()}))
        .query(async ({input}) => {
            return await db.query.translations.findFirst({where: eq(translations.id, input.id)})
        }),
    getBrand: publicProcedure
        .input(z.number())
        .query(async ({input}) => {
            const [brand] = await db.select().from(brandWithScales).where(eq(brandWithScales.id, input))

            if (!brand) {
                throw new SoftHttpError("Brand not found")
            }

            return brand
        }),
    getDatasourceById: publicProcedure
        .input(z.object({id: z.number()}))
        .query(async ({input}) => {
            return await getDatasourceById(input.id)
        }),
    getDatasources: publicProcedure
        .input(z.object({
            isMultiple: z.boolean().optional()
        }).optional())
        .query(async ({input}) => {
            if (input?.isMultiple !== undefined) {
                return await db.query.datasources.findMany({
                    where: eq(datasources.isMultiple, input.isMultiple),
                    orderBy: (datasources, {asc}) => [asc(datasources.name)]
                });
            }
            return await db.query.datasources.findMany({
                orderBy: (datasources, {asc}) => [asc(datasources.name)]
            });
        }),
    getDatasourceValues: publicProcedure
        .input(z.object({
            datasourceId: z.number()
        }))
        .query(async ({input}) => {
            return await db.query.datasourceValues.findMany({
                where: eq(datasourceValues.datasourceId, input.datasourceId)
            });
        }),
    getSystemPrompts: publicProcedure
        .query(async () => {
            return await db.query.systemPrompts.findMany()
        })
})
