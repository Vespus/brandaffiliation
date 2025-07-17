"use server"

import { MetaOutputSchema } from "@/app/dashboard/content-generation/types";
import { db } from "@/db";
import { brands, categories, combinations, contents, tasks } from "@/db/schema";
import { actionClient } from "@/lib/action-client";
import { QSPayClient } from "@/lib/qs-pay-client";
import { QSPayBrand } from "@/qspay-types";
import { eq } from "drizzle-orm";
import z from "zod";

export const saveTask = actionClient
    .inputSchema(
        z.array(
            z.object({
                entityType: z.string(),
                entityId: z.string(),
                status: z.string(),
                specification: z.any(),
                old_value: z.any()
            })
        )
    )
    .action(async ({parsedInput}) => {
        await db.insert(tasks)
            .values(parsedInput)
    })

export const SaveReviewTaskToQSPay = actionClient
    .inputSchema(
        z.object({
            config: MetaOutputSchema,
            content: z.object({
                contentId: z.number(),
                entityType: z.string(),
                entityId: z.string(),
            })
        })
    )
    .action(async ({parsedInput}) => {
        const {entityId, entityType, contentId} = parsedInput.content;
        const [content] = db.select().from(contents).where(eq(contents.id, contentId))

        if (entityType === "brand") {
            const [brand] = await db.select().from(brands).where(eq(brands.integrationId, entityId))
            if (!brand) {
                throw new Error("Brand page not found. BrandAffiliation can't create a new one, please contact Administrators")
            }

            const {result: editResult} = await QSPayClient<QSPayBrand[]>("CmsBrand/EditDescription", {
                method: "POST",
                body: JSON.stringify({
                    brandName: brand.name,
                    config: parsedInput.config
                })
            })

            revalidatePath('/', "layout")
        }

        if (entityType === "combination") {
            const [combination] = await db.select().from(combinations).where(eq(combinations.integrationId, entityId))
            if (!combination) {
                throw new Error("Brand page not found. BrandAffiliation can't create a new one, please contact Administrators")
            }

            const [[brand], [category]] = await Promise.all([
                db.select().from(brands).where(eq(brands.integrationId, combination.brandId)),
                db.select().from(categories).where(eq(categories.integrationId, combination.brandId))
            ])

            if (!brand || !category) {
                throw new Error("An error occurred while creating combination")
            }

            const {result: editResult} = await QSPayClient<QSPayCombin[]>("CmsCombinPage/EditDescription", {
                method: "POST",
                body: JSON.stringify({
                    categoryName: category.name,
                    brandName: brand.name,
                    config: output
                })
            })
            revalidatePath('/', "layout")
        }

        await db.update(contents).set({
            oldConfig: null,
            config: parsedInput.config,
            needsReview: false
        }).where(eq(contents.id, contentId))
    })