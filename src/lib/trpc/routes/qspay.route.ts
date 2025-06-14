import { QSPayClient } from "@/lib/qs-pay-client";
import { createTRPCRouter, publicProcedure } from "@/lib/trpc/trpc";
import { QSPayBrand, QSPayCategory } from "@/qspay-types";

export const qspayRoute = createTRPCRouter({
    getAllBrands: publicProcedure
        .query(async ({input}) => {
            const {result} = await QSPayClient<QSPayBrand[]>("CmsBrand/GetAll")
            return result
        }),
    getAllCategories: publicProcedure
        .query(async () => {
            const {result} = await QSPayClient<QSPayCategory[]>("CmsCategory/GetAll")
            return result
        }),
})
