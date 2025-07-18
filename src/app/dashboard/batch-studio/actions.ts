"use server"

import {MetaOutput, PartialMetaOutputSchema} from "@/app/dashboard/content-generation/types";
import {db} from "@/db";
import {brands, categories, combinations, contents, tasks} from "@/db/schema";
import {actionClient} from "@/lib/action-client";
import {QSPayClient} from "@/lib/qs-pay-client";
import {QSPayBrand, QSPayCategory, QSPayCombin} from "@/qspay-types";
import {and, eq, inArray} from "drizzle-orm";
import z from "zod";
import {revalidatePath} from "next/cache";
import {toMerged} from "es-toolkit";
import {redirect} from "next/navigation";

export const saveTask = actionClient
    .inputSchema(
        z.array(
            z.object({
                entityType: z.string(),
                entityId: z.string(),
                status: z.string(),
                specification: z.any(),
            })
        )
    )
    .action(async ({parsedInput}) => {
        const existingTasks = await db.select().from(tasks).where(
            and(
                inArray(tasks.entityId, parsedInput.map(x => x.entityId)),
                eq(tasks.entityType, parsedInput[0].entityType)
            )
        )

        const existingIdList = existingTasks.map(x => x.entityId)
        const insertTask = parsedInput.filter(x => !existingIdList.includes(x.entityId))
        await db.insert(tasks).values(insertTask)
    })

export const SaveReviewTaskToQSPay = actionClient
    .inputSchema(
        z.object({
            config: PartialMetaOutputSchema,
            content: z.object({
                contentId: z.number(),
                entityType: z.string(),
                entityId: z.string(),
            })
        })
    )
    .action(async ({parsedInput}) => {
        const {entityId, entityType, contentId} = parsedInput.content;

        if (entityType === "brand") {
            const [brand] = await db.select().from(brands).where(eq(brands.integrationId, entityId))
            if (!brand) {
                throw new Error("Brand page not found. BrandAffiliation can't create a new one, please contact Administrators")
            }

            const {result: remoteBrand} = await QSPayClient<QSPayBrand>("CmsBrand/Get", {
                query: {
                    brandId: brand.integrationId!
                }
            })

            const {result: editResult} = await QSPayClient<QSPayBrand>("CmsBrand/EditDescription", {
                method: "POST",
                body: JSON.stringify({
                    brandName: brand.integrationName,
                    config: toMerged(remoteBrand.config, parsedInput.config)
                })
            })
        }

        if (entityType === "category") {
            const [category] = await db.select().from(categories).where(eq(categories.integrationId, entityId))
            if (!category) {
                throw new Error("Brand page not found. BrandAffiliation can't create a new one, please contact Administrators")
            }

            const {result: remoteCategory} = await QSPayClient<QSPayCategory>("CmsCategory/Get", {
                query: {
                    categoryId: category.integrationId!
                }
            })

            const {result: editResult} = await QSPayClient<QSPayCategory>("CmsBrand/EditDescription", {
                method: "POST",
                body: JSON.stringify({
                    brandName: category.integrationName,
                    config: toMerged(remoteCategory.config, parsedInput.config)
                })
            })
        }

        if (entityType === "combination") {
            const [combination] = await db.select().from(combinations).where(eq(combinations.integrationId, entityId))
            if (!combination) {
                throw new Error("Combination page not found. BrandAffiliation can't create a new one, please contact Administrators")
            }

            const [[brand], [category]] = await Promise.all([
                db.select().from(brands).where(eq(brands.integrationId, combination.brandId!)),
                db.select().from(categories).where(eq(categories.integrationId, combination.categoryId!))
            ])

            if (!brand || !category) {
                throw new Error("An error occurred while creating combination")
            }

            const {result: remoteCombination} = await QSPayClient<QSPayCombin>("CmsCombinPage/Get", {
                query: {
                    combinatioId: combination.integrationId!
                }
            })

            console.log('CEM',remoteCombination)

            const {result: editResult} = await QSPayClient<QSPayCombin[]>("CmsCombinPage/EditDescription", {
                method: "POST",
                body: JSON.stringify({
                    categoryName: category.integrationName,
                    brandName: brand.integrationName,
                    config: toMerged(remoteCombination, parsedInput.config)
                })
            })
        }

        await db.update(contents).set({
            oldConfig: null,
            config: parsedInput.config as MetaOutput,
            needsReview: false
        }).where(eq(contents.id, contentId))

        revalidatePath('/', "layout")
        redirect("/dashboard/batch-studio/review")
    })