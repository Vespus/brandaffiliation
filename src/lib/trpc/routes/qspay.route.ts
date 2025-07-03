import { QSPayClient } from "@/lib/qs-pay-client";
import { createTRPCRouter, publicProcedure } from "@/lib/trpc/trpc";
import { QSPayBrand, QSPayCategory, QSPayCombin } from "@/qspay-types";
import { z } from "zod";

type QSPayCategoryWithType = QSPayCategory & {
    type: "category";
}

type QSPayBrandWithType = QSPayBrand & {
    type: "brand";
}

type QSPayCombinWithType = QSPayCombin & {
    type: "combin";
}

type UnionQSPayOutputs = QSPayCombinWithType | QSPayBrandWithType | QSPayCategoryWithType

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
    getEntity: publicProcedure
        .input(z.object({
            categoryId: z.number().optional(),
            brandId: z.number().optional()
        }))
        .query(async ({input: {brandId, categoryId}}): Promise<UnionQSPayOutputs> => {
            if (brandId && categoryId) {
                //combin page
                const {result: allCombinationPages} = await QSPayClient<QSPayCombin[]>("CmsCombinPage/GetAll")
                const foundCombinationPage = allCombinationPages.find(cp => Number(cp.category?.id || 0) === categoryId && Number(cp.brand?.id || 0) === brandId)

                if (!foundCombinationPage) {
                    throw new Error("Combination page not found. BrandAffiliation can't create a new one, please create one manually then try again.")
                }

                const {result} = await QSPayClient<QSPayCombin>("CmsCombinPage/Get", {
                    query: {
                        combinatioId: foundCombinationPage.id
                    }
                })

                return {type: "combin", ...result}
            }
            if (brandId && !categoryId) {
                //brand page
                const {result: allBrandPages} = await QSPayClient<QSPayBrand[]>("CmsBrand/GetAll")
                const foundBrandPage = allBrandPages.find(cp => Number(cp.id) === brandId)

                if (!foundBrandPage) {
                    throw new Error("Brand page not found. BrandAffiliation can't create a new one, please create one manually then try again.")
                }

                const {result} = await QSPayClient<QSPayBrand>("CmsBrand/Get", {
                    query: {
                        brandId: foundBrandPage.id
                    }
                })

                return {type: 'brand', ...result}
            }

            if (!brandId && categoryId) {
                //category page
                const {result: allCategoryPages} = await QSPayClient<QSPayCategory[]>("CmsCategory/GetAll")
                const foundCategoryPage = allCategoryPages.find(cp => Number(cp.id) === categoryId)

                if (!foundCategoryPage) {
                    throw new Error("Category page not found. BrandAffiliation can't create a new one, please create one manually then try again.")
                }

                const {result} = await QSPayClient<QSPayCategory>("CmsCategory/Get", {
                    query: {
                        categoryId: foundCategoryPage.id
                    }
                })

                return {type: 'category', ...result}
            }

            throw new Error("Something went wrong. Please try again. If the problem persists, please contact support.")
        })
})
