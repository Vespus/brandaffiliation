import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

import { generateObject } from 'ai'
import { and, eq, inArray, sql } from 'drizzle-orm'
import z from 'zod'
import { BatchContentGenerateSchemaType } from '@/app/dashboard/batch-studio/schema'
import { MetaOutputSchema } from '@/app/dashboard/content-generation/types'
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
import { Task } from '@/db/types'
import { getStore } from '@/utils/get-store'

export const maxDuration = 60

const bodySchema = z.object({
    taskId: z.number(),
})

export const POST = async (req: NextRequest) => {
    const { data: context } = bodySchema.safeParse(await req.json())
    const store = await getStore()

    if (!context) {
        throw new Error('Invalid request')
    }

    const [task] = await db.select().from(tasks).where(eq(tasks.id, context.taskId))
    const specifications = task.specification as BatchContentGenerateSchemaType

    const [[model], prompt] = await Promise.all([
        getAIModelsWithProviderAndSettings([specifications.aiModel]),
        db.query.systemPrompts.findFirst({
            where: eq(systemPrompts.id, specifications.prompt),
        }),
    ])

    const userPrompt: string[] = []
    userPrompt.push(`<Store><StoreName>${store?.name}</StoreName></Store>`)

    if (specifications.userPromptPrefix) {
        userPrompt.push(specifications.userPromptPrefix)
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

    userPrompt.push(await handleDataSources({ dataSources: specifications.dataSources }))

    await db.update(tasks).set({ status: 'inProgress' }).where(eq(tasks.id, task.id))

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
    } catch (e) {
        await db.update(tasks).set({ status: 'failed' }).where(eq(tasks.id, task.id))
        throw e
    }

    await db.delete(tasks).where(eq(tasks.id, task.id))

    revalidatePath('/', 'layout')
    return NextResponse.json({ status: 'ok' })
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
            config: contents.config,
        })
        .from(brandWithScales)
        .leftJoin(brandsStores, eq(brandsStores.brandId, brandWithScales.id))
        .leftJoin(
            contents,
            and(
                eq(contents.entityId, brandsStores.integrationId),
                eq(contents.entityType, 'brand'),
                eq(contents.storeId, task.storeId)
            )
        )
        .where(eq(brandsStores.integrationId, id || task.entityId))

    const scales = scaleMap.filter((s) => brand.brand[s]).map((s) => `${s}:${brand.brand[s]}/5`)

    const brandHeaderInformation = `<BrandName>${brand.brand.name}</BrandName>`
    const brandMetaData = brand.config
        ? `<BrandExistingMetaData>${JSON.stringify(brand.config)}</BrandExistingMetaData>`
        : ''
    const brandScaleInformation =
        scales.length > 0 ? `<BrandScales>${scales.map((s) => `<Scale>${s}</Scale>`).join('')}</BrandScales>` : ''
    const brandCharacteristics =
        (brand.brand.characteristic?.length || 0) > 0
            ? `<BrandCharacteristics>${brand.brand.characteristic?.map((c) => `<Characteristic>${c.value}</Characteristic>`).join('\n')}</BrandCharacteristics>`
            : ''

    const output = [brandHeaderInformation]
    if (brand.config && task.specification?.useBrandContent) {
        output.push(brandMetaData)
        output.push(brandScaleInformation)
        output.push(brandCharacteristics)
    }

    return `<Brand>${output.filter(Boolean).join('')}</Brand>`
}
const processCategory = async (task: Task, id?: string) => {
    const [category] = await db
        .select()
        .from(categoriesStores)
        .innerJoin(categories, eq(categories.id, categoriesStores.categoryId))
        .leftJoin(
            contents,
            and(
                eq(contents.entityId, categoriesStores.integrationId),
                eq(contents.entityType, 'category'),
                eq(contents.storeId, task.storeId)
            )
        )
        .where(eq(categoriesStores.integrationId, id || task.entityId))

    const categoryHeaderInformation = `<CategoryName>${category.categories.description}</CategoryName>`
    const categoryMetaData = category.contents
        ? `<CategoryExistingMetaData>${JSON.stringify(category.contents.config)}</CategoryExistingMetaData>`
        : ''

    const output = [categoryHeaderInformation]
    if (category.contents?.config && task.specification?.useCategoryContent) {
        output.push(categoryMetaData)
    }

    return `<Category>${output.filter(Boolean).join('')}</Category>`
}
const processCombination = async (task: Task) => {
    const [combination] = await db
        .select()
        .from(combinations)
        .leftJoin(
            contents,
            and(
                eq(contents.entityId, combinations.integrationId),
                eq(contents.entityType, 'combination'),
                eq(contents.storeId, task.storeId)
            )
        )
        .leftJoin(brandsStores, eq(combinations.brandId, brandsStores.integrationId))
        .leftJoin(categoriesStores, eq(combinations.categoryId, categoriesStores.integrationId))
        .leftJoin(brands, eq(brandsStores.brandId, brands.id))
        .leftJoin(categories, eq(categoriesStores.categoryId, categories.id))
        .where(eq(combinations.integrationId, task.entityId))

    const brandContent = await processBrand(task, combination.combinations.brandId!)
    const categoryContent = await processCategory(task, combination.combinations.categoryId!)

    const combinationHeaderInformation = `<CombinationPageName>${combination.brands?.name} - ${combination.categories?.description}</CombinationPageName>`
    const combinationMetaData = combination.contents
        ? `<CombinationPageExistingMetaData>${JSON.stringify(combination.contents.config)}</CombinationPageExistingMetaData>`
        : ''

    const output = [combinationHeaderInformation]
    if (combination.contents?.config) {
        output.push(combinationMetaData)
    }

    return brandContent + categoryContent + `<CombinationPage>${output.filter(Boolean).join('')}</CombinationPage>`
}
