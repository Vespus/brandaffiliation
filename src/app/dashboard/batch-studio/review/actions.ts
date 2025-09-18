'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { and, eq } from 'drizzle-orm'
import { toMerged } from 'es-toolkit'
import z from 'zod'
import { MetaOutput, PartialMetaOutput, PartialMetaOutputSchema } from '@/app/dashboard/content-generation/types'
import { db } from '@/db'
import { brands, brandsStores, categories, categoriesStores, combinations, contents, reviews } from '@/db/schema'
import { Review } from '@/db/types'
import { actionClient } from '@/lib/action-client'
import { QSPayClient } from '@/lib/qs-pay-client'
import { QSPayBrand, QSPayCategory, QSPayCombin } from '@/qspay-types'

export const removeReviewTask = actionClient
    .inputSchema(z.object({ reviewId: z.number() }))
    .action(async ({ parsedInput }) => {
        if (!parsedInput.reviewId) {
            throw new Error('An error occurred while removing review task. ReviewId is required')
        }

        await db.delete(reviews).where(eq(reviews.id, parsedInput.reviewId))

        revalidatePath('/dashboard/batch-studio/review', 'layout')
    })

export const SaveReviewTaskToQSPay = actionClient
    .inputSchema(
        z.array(
            z.object({
                config: PartialMetaOutputSchema.optional(),
                reviewId: z.number(),
            })
        )
    )
    .action(async ({ parsedInput }) => {
        await db.transaction(async (tx) => {
            await Promise.all(
                parsedInput.map(async ({ config, reviewId }) => {
                    const [review] = await tx.select().from(reviews).where(eq(reviews.id, reviewId))
                    const [content] = await tx
                        .select()
                        .from(contents)
                        .where(and(eq(contents.entityId, review.entityId), eq(contents.entityType, review.entityType), eq(contents.storeId, review.storeId!)))

                    await processQSPay({ review, config })

                    if (content) {
                        await tx
                            .update(contents)
                            .set({
                                config: (config as MetaOutput) || (review.config as MetaOutput) || {},
                            })
                            .where(eq(contents.id, content.id))
                    } else {
                        await tx.insert(contents).values({
                            config: (config as MetaOutput) || (review.config as MetaOutput) || {},
                            entityId: review.entityId,
                            entityType: review.entityType,
                            storeId: review.storeId,
                        })
                    }

                    await tx
                        .update(reviews)
                        .set({
                            previousConfig: content?.config as MetaOutput,
                            config: config as MetaOutput,
                            approved: true,
                            approvedAt: new Date(),
                        })
                        .where(eq(reviews.id, reviewId))
                })
            )
        })

        revalidatePath('/', 'layout')
        redirect('/dashboard/batch-studio/review')
    })

const processQSPay = async ({ review, config }: { review: Review; config?: PartialMetaOutput }) => {
    try {
        if (review.entityType === 'brand') {
            const [brand] = await db.select().from(brandsStores).where(eq(brandsStores.integrationId, review.entityId))
            if (!brand) {
                throw new Error(
                    "Brand page not found. BrandAffiliation can't create a new one, please contact Administrators"
                )
            }

            const { result: remoteBrand } = await QSPayClient<QSPayBrand>('CmsBrand/Get', {
                query: {
                    brandId: brand.integrationId!,
                    storeId: brand.storeId!,
                },
            })

            await QSPayClient<QSPayBrand>('CmsBrand/EditDescription', {
                method: 'POST',
                body: JSON.stringify({
                    brandName: brand.integrationName,
                    config: toMerged(remoteBrand.config, config || (review.config as MetaOutput) || {}),
                }),
            })
        }

        if (review.entityType === 'category') {
            const [category] = await db
                .select()
                .from(categoriesStores)
                .where(and(eq(categoriesStores.integrationId, review.entityId), eq(categoriesStores.storeId, review.storeId!)))

            if (!category) {
                throw new Error(
                    "Category page not found. BrandAffiliation can't create a new one, please contact Administrators"
                )
            }

            const { result: remoteCategory } = await QSPayClient<QSPayCategory>('CmsCategory/Get', {
                query: {
                    categoryId: category.integrationId!,
                    storeId: category.storeId!,
                },
            })

            await QSPayClient<QSPayCategory>('CmsCategory/EditDescription', {
                method: 'POST',
                body: JSON.stringify({
                    categoryName: category.integrationName,
                    config: toMerged(remoteCategory.config, config || (review.config as MetaOutput) || {}),
                    storeId: category.storeId!,
                }),
            })
        }

        if (review.entityType === 'combination') {
            const [combination] = await db
                .select({
                    combination: combinations,
                    brand: brands,
                    category: categories,
                    brandsStores: brandsStores,
                    categoriesStores: categoriesStores,
                })
                .from(combinations)
                .innerJoin(brandsStores, and(eq(brandsStores.integrationId, combinations.brandId), eq(brandsStores.storeId, review.storeId!)))
                .innerJoin(categoriesStores, and(eq(categoriesStores.integrationId, combinations.categoryId), eq(categoriesStores.storeId, review.storeId!)))
                .innerJoin(brands, eq(brands.id, brandsStores.brandId))
                .innerJoin(categories, eq(categories.id, categoriesStores.categoryId))
                .where(and(eq(combinations.integrationId, review.entityId), eq(combinations.storeId, review.storeId!)))

            if(!combination) {
                console.log(review, combination)
            }

            const remoteCombination = await QSPayClient<QSPayCombin>('CmsCombinPage/Get', {
                query: {
                    combinatioId: review.entityId,
                    storeId: review.storeId!,
                },
            }).then((x) => x.result)

            if (!remoteCombination) {
                const addResult = await QSPayClient<string>('CmsCombinPage/Add', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: combination.combination.name,
                        description: combination.combination.description,
                        brandId: combination.brandsStores.integrationId!,
                        categoryId: combination.categoriesStores.integrationId!,
                        storeId: combination.combination.storeId!,
                    }),
                })

                await Promise.all([
                    db
                        .update(combinations)
                        .set({
                            integrationId: addResult.result,
                        })
                        .where(eq(combinations.id, combination.combination.id)),
                    db
                        .update(reviews)
                        .set({
                            entityId: addResult.result,
                            entityType: 'combination',
                        })
                        .where(eq(reviews.id, review.id)),
                ])
            }

            await QSPayClient<QSPayCombin[]>('CmsCombinPage/EditDescription', {
                method: 'POST',
                body: JSON.stringify({
                    categoryName: combination.categoriesStores.integrationName,
                    brandName: combination.brandsStores.integrationName,
                    storeId: combination.combination.storeId!,
                    config: toMerged(remoteCombination?.config || {}, config || (review.config as MetaOutput) || {}),
                }),
            })
        }
    } catch (e) {
        console.error(e)
        throw e
    }
}
