import {createTRPCRouter, publicProcedure} from "@/lib/trpc/trpc";
import {db} from "@/db";

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
        })
})