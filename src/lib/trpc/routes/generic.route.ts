import {createTRPCRouter, publicProcedure} from "@/lib/trpc/trpc";
import {db} from "@/db";
import {eq} from "drizzle-orm";
import {aiModels, brand as brandTable, BrandWithCharacteristic} from "@/db/schema";
import {z} from "zod";
import {AISetting, getAISettings} from "@/db/presets";
import {formatPrompt} from "@/app/api/completion/utils";

export const genericRoute = createTRPCRouter({
    getBrandsWithCharacteristics: publicProcedure
        .query(async () => {
            const brands = await db.query.brand.findMany({
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
            aiModelId: z.number()
        }))
        .query(async ({input}) => {
            const [brand, aiModel] = await Promise.all([
                db.query.brand.findFirst({
                    where: eq(brandTable.id, input.brand),
                    with: {
                        characteristic: true
                    }
                }),
                db.query.aiModels.findFirst({where: eq(aiModels.id, input.aiModelId)})
            ])

            if(!aiModel){
                throw new Error("AI Model not found")
            }

            const settings = await getAISettings(aiModel.modelName) as AISetting
            if(!settings) {
                throw new Error("No prompt found for selected model")
            }

            return formatPrompt({
                category: input.category,
                season: input.season,
                brand: brand as BrandWithCharacteristic,
                prompt: settings.prompt
            })
        })
})