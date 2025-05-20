import {createTRPCRouter, publicProcedure} from "@/lib/trpc/trpc";
import {db} from "@/db";
import {eq} from "drizzle-orm";
import {
    aiModels,
    brands as brandTable,
    brandWithScales,
    translations,
    userPrompts
} from "@/db/schema";
import {z} from "zod";
import {formatPrompt} from "@/app/dashboard/content-generation/utils";
import {createClient} from "@/db/supabase";
import { ContentGenerateSchema } from "@/app/dashboard/content-generation/schema";

export const genericRoute = createTRPCRouter({
    getBrandsWithCharacteristics: publicProcedure
        .query(async () => {
            const brands = await db.query.brands.findMany({
                with: {
                    characteristic: true
                }
            })

            return brands
        }),
    getCategories: publicProcedure
        .query(async () => {
            return await import("@/categories.json").then(x => x.categories)
        }),
    getAIModels: publicProcedure
        .query(async () => {
            return await db.query.aiModels.findMany({
                where: (
                    eq(aiModels.isActive, true)
                ),
                with: {
                    provider: {
                        columns: {
                            name: true,
                            code: true
                        }
                    }
                }
            })
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
                throw new Error("Brand not found")
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
            const {error, data: {user}} = await (await createClient()).auth.getUser();

            if(error) {
                throw error
            }

            return await db.query.userPrompts.findMany({where: eq(userPrompts.userId, user!.id)})
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
                throw new Error("Brand not found")
            }

            return brand
        }),
    promptPreview: publicProcedure
        .input(ContentGenerateSchema)
        .query(async ({input}) => {
            const [brand] = await db.select().from(brandWithScales).where(eq(brandWithScales.id, input.brand))
            return formatPrompt({
                category: input.category,
                season: input.season,
                brand: brand,
                prompt: input.customPrompt
            })
        })
})