import { NextRequest } from 'next/server';



import { generateObject } from 'ai';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import z from 'zod';
import { BatchContentGenerateSchemaType } from '@/app/dashboard/batch-studio/schema';
import { MetaOutputSchema } from '@/app/dashboard/content-generation/types';
import { getDriver } from '@/app/dashboard/content-generation/utils'
import { db } from '@/db'
import { getAIModelsWithProviderAndSettings } from '@/db/presets'
import {
    brandWithScales,
    brands,
    brandsStores,
    categories,
    categoriesStores,
    combinations,
    contents,
    datasourceValues,
    datasources,
    reviews,
    systemPrompts,
    tasks,
} from '@/db/schema'
import { Task } from '@/db/types';
import { QSPayStore } from '@/qspay-types';
import { getStore } from '@/utils/get-store';


export const maxDuration = 60

const bodySchema = z.object({
    taskId: z.number(),
})

export const POST = async (req: NextRequest) => {
    const { data: context } = bodySchema.safeParse(await req.json())

    if (!context) {
        throw new Error('Invalid request')
    }

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
        async start(controller) {
            const send = (payload: unknown) => {
                controller.enqueue(encoder.encode(JSON.stringify(payload) + '\n'))
            }
            const statuses: string[] = []

            statuses.push('initiated...')
            send({ statuses })

            const store = (await getStore()) as Awaited<QSPayStore>
            const [task] = await db.select().from(tasks).where(eq(tasks.id, context.taskId))

            const [[model], prompt] = await Promise.all([
                getAIModelsWithProviderAndSettings([task.specification!.aiModel]),
                db.query.systemPrompts.findFirst({
                    where: eq(systemPrompts.id, task.specification!.prompt),
                }),
            ])

            statuses.push('fetched necessary data...')
            send({ statuses })
            await new Promise((resolve) => setTimeout(resolve, 200))

            const userPrompt = await generateUserPrompt({ store, task })

            statuses.push('prompt generated...')
            send({ statuses })
            await new Promise((resolve) => setTimeout(resolve, 1000))

            await db.update(tasks).set({ status: 'inProgress' }).where(eq(tasks.id, task.id))

            statuses.push('AI generation in progress...')
            send({ statuses })

            try {
                const driver = getDriver(model)
                const finalUserPrompt = userPrompt.filter(Boolean).join('\n')
                const { object, usage } = await generateObject({
                    model: driver,
                    maxOutputTokens: model.settings.maxTokens,
                    temperature: model.settings.temperature,
                    topP: model.settings.topP,
                    frequencyPenalty: model.settings.frequencyPenalty,
                    presencePenalty: model.settings.presencePenalty,
                    system: prompt!.prompt,
                    schema: MetaOutputSchema,
                    prompt: finalUserPrompt,
                })

                await db.insert(reviews).values({
                    entityId: task.entityId,
                    entityType: task.entityType,
                    config: object,
                    approved: false,
                    storeId: task.storeId,
                    usage: usage,
                    userPrompt: {
                        prompt: finalUserPrompt,
                        system: prompt!.prompt,
                    },
                })
                statuses.push('AI generation completed...')
                send({ statuses })
            } catch (e) {
                statuses.push('AI generation failed...')
                send({ statuses })
                send({ done: true })
                controller.error(e)
                controller.close()
                return
            }

            await db.delete(tasks).where(eq(tasks.id, task.id))

            statuses.push('Task ready to review.')
            send({ statuses })
            send({ done: true })
            controller.close()
        },
    })

    return new Response(stream, {
        headers: {
            'Content-Type': 'application/x-ndjson; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
        },
    })
}

const generateUserPrompt = async ({ store, task }: { store: QSPayStore; task: Task }) => {
    const userPrompt: string[] = []
    userPrompt.push(`<Store><StoreName>${store?.name}</StoreName></Store>`)

    if (task.specification!.userPromptPrefix) {
        userPrompt.push(task.specification!.userPromptPrefix)
    }

    if (task.entityType === 'brand') {
        userPrompt.push(await processBrand(task))
    }

    if (task.entityType === 'category') {
        userPrompt.push(await processCategory(task))
    }

    if (task.entityType === 'combination') {
        userPrompt.push(await processCombination(task))
    }

    userPrompt.push(await handleDataSources({ dataSources: task.specification!.dataSources }))

    return userPrompt
}
const handleDataSources = async ({ dataSources }: Pick<BatchContentGenerateSchemaType, 'dataSources'>) => {
    const queryableDataSources = dataSources?.filter((ds) => ds.datasourceId)
    const prompt: string[] = []
    if (queryableDataSources) {
        for await (const source of queryableDataSources) {
            const [ds] = await db
                .select({
                    name: datasources.name,
                    description: datasources.description,
                    // prettier-ignore
                    data: sql<string[]>`array_agg((${datasourceValues.data}->>${datasources.valueColumn})::text)`,
                })
                .from(datasources)
                .leftJoin(
                    datasourceValues,
                    and(
                        eq(datasourceValues.datasourceId, datasources.id),
                        inArray(datasourceValues.id, [source.datasourceValueId!])
                    )
                )
                .where(eq(datasources.id, source.datasourceId as number))
                .groupBy(datasources.id)

            prompt.push(`<Datasource>${source.datasourcePrompt}: ${ds.data.join(', ')}</Datasource>`)
        }
    }

    return prompt.join('\n')
}
const processBrand = async (task: Task, id?: string) => {
    const scaleMap = [
        'price',
        'quality',
        'focus',
        'design',
        'positioning',
        'origin',
        'heritage',
        'recognition',
        'revenue',
    ]

    const [brand] = await db
        .select({
            brand: brandWithScales,
        })
        .from(brandWithScales)
        .leftJoin(brandsStores, eq(brandsStores.brandId, brandWithScales.id))
        .where(eq(brandsStores.integrationId, id || task.entityId))

    const brandHeaderInformation = `<BrandName>${brand.brand.name}</BrandName>`
    const output = [brandHeaderInformation]

    if (task.specification?.useContent) {
        //task.specification?.useContentFrom --> store id
        const targetStoreId = task.specification.useContentFrom!
        const [targetContent] = await db
            .select({
                config: contents.config,
            })
            .from(brandsStores)
            .leftJoin(
                contents,
                and(eq(contents.entityId, brandsStores.integrationId), eq(contents.entityType, 'brand'))
            )
            .where(and(eq(brandsStores.slug, brand.brand.slug!), eq(brandsStores.storeId, targetStoreId)))

        const scales = scaleMap.filter((s) => brand.brand[s]).map((s) => `${s}:${brand.brand[s]}/5`)

        const brandMetaData =
            targetContent && targetContent.config
                ? `<BrandExistingMetaData>${JSON.stringify(targetContent.config)}</BrandExistingMetaData>`
                : ''
        const brandScaleInformation =
            scales.length > 0 ? `<BrandScales>${scales.map((s) => `<Scale>${s}</Scale>`).join('')}</BrandScales>` : ''
        const brandCharacteristics =
            (brand.brand.characteristic?.length || 0) > 0
                ? `<BrandCharacteristics>${brand.brand.characteristic?.map((c) => `<Characteristic>${c.value}</Characteristic>`).join('\n')}</BrandCharacteristics>`
                : ''

        output.push(brandMetaData)
        output.push(brandScaleInformation)
        output.push(brandCharacteristics)
    }

    return `<Brand>${output.filter(Boolean).join('')}</Brand>`
}
const processCategory = async (task: Task, id?: string) => {
    const parentAlias = alias(categories, 'parent')
    const [category] = await db
        .select({
            categories: categories,
            categoryStore: categoriesStores,
            parentCategory: parentAlias,
        })
        .from(categoriesStores)
        .innerJoin(categories, eq(categories.id, categoriesStores.categoryId))
        .leftJoin(parentAlias, eq(parentAlias.id, categories.parentId))
        .where(eq(categoriesStores.integrationId, id || task.entityId))
        .limit(1)

    const categoryHeaderInformation = `<CategoryName>${category.categories.description}</CategoryName>`
    const categoryParentInformation = category.parentCategory
        ? `<CategoryParent>${category.parentCategory.description}</CategoryParent>`
        : ''

    const output = [categoryHeaderInformation, categoryParentInformation].filter(Boolean)

    if (task.specification?.useContent) {
        const targetStoreId = task.specification.useContentFrom!
        const [targetContent] = await db
            .select({
                config: contents.config,
            })
            .from(categoriesStores)
            .leftJoin(
                contents,
                and(eq(contents.entityId, categoriesStores.integrationId), eq(contents.entityType, 'category'))
            )
            .where(
                and(
                    eq(categoriesStores.slug, category.categories.slug!),
                    eq(categoriesStores.storeId, targetStoreId),
                    eq(contents.storeId, targetStoreId)
                )
            )

        const categoryMetaData = targetContent
            ? `<CategoryExistingMetaData>${JSON.stringify(targetContent.config)}</CategoryExistingMetaData>`
            : ''

        output.push(categoryMetaData)
    }

    return `<Category>${output.filter(Boolean).join('')}</Category>`
}
const processCombination = async (task: Task) => {
    const [combination] = await db
        .select()
        .from(combinations)
        .leftJoin(brandsStores, eq(combinations.brandId, brandsStores.integrationId))
        .leftJoin(categoriesStores, eq(combinations.categoryId, categoriesStores.integrationId))
        .leftJoin(brands, eq(brandsStores.brandId, brands.id))
        .leftJoin(categories, eq(categoriesStores.categoryId, categories.id))
        .where(eq(combinations.integrationId, task.entityId))

    const brandContent = await processBrand(task, combination.combinations.brandId!)
    const categoryContent = await processCategory(task, combination.combinations.categoryId!)
    const combinationHeaderInformation = `<CombinationPageName>${combination.brands?.name} - ${combination.categories?.description}</CombinationPageName>`

    const output = [combinationHeaderInformation]
    if (task.specification?.useContent) {
        const targetStoreId = task.specification.useContentFrom!
        const [targetContent] = await db
            .select({
                config: contents.config,
            })
            .from(combinations)
            .leftJoin(
                brandsStores,
                and(eq(brandsStores.slug, combination.brands!.slug!), eq(brandsStores.storeId, targetStoreId))
            )
            .leftJoin(
                categoriesStores,
                and(
                    eq(categoriesStores.slug, combination.categories!.slug!),
                    eq(categoriesStores.storeId, targetStoreId)
                )
            )
            .leftJoin(
                contents,
                and(
                    eq(contents.entityId, combinations.integrationId),
                    eq(contents.entityType, 'combination'),
                    eq(contents.storeId, targetStoreId)
                )
            )
            .where(
                and(
                    eq(combinations.storeId, targetStoreId),
                    eq(combinations.brandId, brandsStores.integrationId),
                    eq(combinations.categoryId, categoriesStores.integrationId)
                )
            )

        const combinationMetaData =
            targetContent && targetContent.config
                ? `<CombinationPageExistingMetaData>${JSON.stringify(targetContent.config)}</CombinationPageExistingMetaData>`
                : ''
        output.push(combinationMetaData)
    }

    return brandContent + categoryContent + `<CombinationPage>${output.filter(Boolean).join('')}</CombinationPage>`
}
