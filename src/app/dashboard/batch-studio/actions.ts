'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { and, eq, inArray } from 'drizzle-orm'
import { toMerged } from 'es-toolkit'
import z from 'zod'
import { MetaOutput, PartialMetaOutput, PartialMetaOutputSchema } from '@/app/dashboard/content-generation/types'
import { db } from '@/db'
import { brands, categories, combinations, contents, tasks } from '@/db/schema'
import { Content } from '@/db/types'
import { actionClient } from '@/lib/action-client'
import { QSPayClient } from '@/lib/qs-pay-client'
import { QSPayBrand, QSPayCategory, QSPayCombin } from '@/qspay-types'

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
    .action(async ({ parsedInput }) => {
        const existingTasks = await db
            .select()
            .from(tasks)
            .where(
                and(
                    inArray(
                        tasks.entityId,
                        parsedInput.map((x) => x.entityId)
                    ),
                    eq(tasks.entityType, parsedInput[0].entityType)
                )
            )

        const existingIdList = existingTasks.map((x) => x.entityId)
        const insertTask = parsedInput.filter((x) => !existingIdList.includes(x.entityId))

        if (insertTask.length === 0) {
            throw new Error('No new task to save, Selected entities may already have a task')
        }

        await db.insert(tasks).values(insertTask)
    })

export const SaveReviewTaskToQSPay = actionClient
    .inputSchema(
        z.array(
            z.object({
                config: PartialMetaOutputSchema.optional(),
                contentId: z.number(),
            })
        )
    )
    .action(async ({ parsedInput }) => {
        await db.transaction(async (tx) => {
            await Promise.all(
                parsedInput.map(async ({ config, contentId }) => {
                    const [content] = await tx.select().from(contents).where(eq(contents.id, contentId))
                    await processQSPay({ content, config })
                    await tx
                        .update(contents)
                        .set({
                            oldConfig: null,
                            config: config as MetaOutput,
                            needsReview: false,
                        })
                        .where(eq(contents.id, contentId))
                })
            )
        })

        revalidatePath('/', 'layout')
        redirect('/dashboard/batch-studio/review')
    })

const processQSPay = async ({ content, config }: { content: Content; config?: PartialMetaOutput }) => {
    try {
        if (content.entityType === 'brand') {
            const [brand] = await db.select().from(brands).where(eq(brands.integrationId, content.entityId))
            if (!brand) {
                throw new Error(
                    "Brand page not found. BrandAffiliation can't create a new one, please contact Administrators"
                )
            }

            const { result: remoteBrand } = await QSPayClient<QSPayBrand>('CmsBrand/Get', {
                query: {
                    brandId: brand.integrationId!,
                },
            })

            await QSPayClient<QSPayBrand>('CmsBrand/EditDescription', {
                method: 'POST',
                body: JSON.stringify({
                    brandName: brand.integrationName,
                    config: toMerged(remoteBrand.config, config || (content.config as MetaOutput) || {}),
                }),
            })
        }

        if (content.entityType === 'category') {
            const [category] = await db.select().from(categories).where(eq(categories.integrationId, content.entityId))
            if (!category) {
                throw new Error(
                    "Brand page not found. BrandAffiliation can't create a new one, please contact Administrators"
                )
            }

            const { result: remoteCategory } = await QSPayClient<QSPayCategory>('CmsCategory/Get', {
                query: {
                    categoryId: category.integrationId!,
                },
            })

            await QSPayClient<QSPayCategory>('CmsBrand/EditDescription', {
                method: 'POST',
                body: JSON.stringify({
                    brandName: category.integrationName,
                    config: toMerged(remoteCategory.config, config || (content.config as MetaOutput) || {}),
                }),
            })
        }

        if (content.entityType === 'combination') {
            const [combination] = await db
                .select()
                .from(combinations)
                .where(eq(combinations.integrationId, content.entityId))
            if (!combination) {
                throw new Error(
                    "Combination page not found. BrandAffiliation can't create a new one, please contact Administrators"
                )
            }

            const [[brand], [category]] = await Promise.all([
                db.select().from(brands).where(eq(brands.integrationId, combination.brandId!)),
                db.select().from(categories).where(eq(categories.integrationId, combination.categoryId!)),
            ])

            if (!brand || !category) {
                throw new Error('An error occurred while creating combination')
            }

            const { result: remoteCombination } = await QSPayClient<QSPayCombin>('CmsCombinPage/Get', {
                query: {
                    combinatioId: combination.integrationId!,
                },
            })

            await QSPayClient<QSPayCombin[]>('CmsCombinPage/EditDescription', {
                method: 'POST',
                body: JSON.stringify({
                    categoryName: category.integrationName,
                    brandName: brand.integrationName,
                    config: toMerged(remoteCombination?.config || {}, config || (content.config as MetaOutput) || {}),
                }),
            })
        }
    } catch (e) {
        console.error(e)
        throw e
    }
}
