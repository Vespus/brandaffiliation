import {createTRPCRouter, publicProcedure} from "@/lib/trpc/trpc";
import {z} from "zod";
import {
    brands,
    brandWithScales, categories,
    combinations,
    contents,
    datasources,
    datasourceValues,
    systemPrompts,
    tasks
} from "@/db/schema";
import {and, eq, inArray, isNull, sql} from "drizzle-orm";
import {db} from "@/db";
import {getAIModelsWithProviderAndSettings} from "@/db/presets";
import {BatchContentGenerateSchemaType} from "@/app/dashboard/batch-studio/schema";
import {getDriver} from "@/app/dashboard/content-generation/utils";
import {generateObject} from "ai";
import {MetaOutputSchema} from "@/app/dashboard/content-generation/types";

export const batchStudioRoute = createTRPCRouter({
    getAllBrands: publicProcedure
        .query(async () => {
            const data = await db.select({
                name: brands.name,
                slug: brands.slug,
                content: contents.config,
                integrationId: brands.integrationId,
                hasContent: sql<boolean>`(${contents.config} IS NOT NULL)`.as('hasContent'),
            })
                .from(brands)
                .leftJoin(contents, and(eq(contents.entityId, brands.integrationId), eq(contents.entityType, "brand")))

            return data
        }),
    getAllBrandsWithNoContent: publicProcedure
        .query(async () => {
            const data = await db.select({
                name: brands.name,
                slug: brands.slug,
                content: contents.config,
                integrationId: brands.integrationId,
                hasContent: sql<boolean>`(${contents.config} IS NOT NULL)`.as('hasContent'),
            })
                .from(brands)
                .leftJoin(contents, and(eq(contents.entityId, brands.integrationId), eq(contents.entityType, "brand")))
                .where(isNull(contents.config))
            return data
        }),
    getAllCombinations: publicProcedure
        .query(async () => {
            const data = await db.select({
                name: combinations.name,
                description: combinations.description,
                content: contents.config,
                integrationId: combinations.integrationId,
                hasContent: sql<boolean>`(${contents.config} IS NOT NULL)`.as('hasContent'),
            })
                .from(combinations)
                .leftJoin(contents, and(eq(contents.entityId, combinations.integrationId), eq(contents.entityType, "combination")))

            return data
        }),
    getAllCombinationsWithNoContent: publicProcedure
        .query(async () => {
            const data = await db.select({
                name: combinations.name,
                description: combinations.description,
                content: contents.config,
                integrationId: combinations.integrationId,
                hasContent: sql<boolean>`(${contents.config} IS NOT NULL)`.as('hasContent'),
            })
                .from(combinations)
                .leftJoin(contents, and(eq(contents.entityId, combinations.integrationId), eq(contents.entityType, "combination")))
                .where(isNull(contents.config))

            return data
        }),
    process: publicProcedure
        .input(z.number())
        .mutation(async ({input}) => {
            const [task] = await db.select().from(tasks).where(eq(tasks.id, input))
            const specifications = task.specification as BatchContentGenerateSchemaType

            const [[model], prompt] = await Promise.all([
                getAIModelsWithProviderAndSettings([specifications.aiModel]),
                db.query.systemPrompts.findFirst({
                    where: eq(systemPrompts.id, specifications.prompt)
                }),
            ])

            const userPrompt: string[] = []

            if (task.entityType === "brand") {
                userPrompt.push(await processBrand(task.entityId as string))
            }

            if(task.entityType === "category"){
                userPrompt.push(await processCategory(task.entityId as string))
            }

            if(task.entityType === "combination"){
                userPrompt.push(await processCombination(task.entityId as string))
            }

            userPrompt.push(await handleDataSources({dataSources: specifications.dataSources}))

            const driver = getDriver(model)

            const {object} = await generateObject({
                model: driver,
                maxTokens: model.settings.maxTokens,
                temperature: model.settings.temperature,
                topP: model.settings.topP,
                frequencyPenalty: model.settings.frequencyPenalty,
                presencePenalty: model.settings.presencePenalty,
                system: prompt!.prompt,
                schema: MetaOutputSchema,
                prompt: userPrompt.join("\n"),
            })

            return object
        })
})

const handleDataSources = async ({dataSources}: Pick<BatchContentGenerateSchemaType, "dataSources">) => {
    const queryableDataSources = dataSources?.filter(ds => ds.datasourceId)
    const prompt: string[] = []
    if (queryableDataSources) {
        for await (const source of queryableDataSources) {
            const [ds] = await db.select({
                name: datasources.name,
                description: datasources.description,
                data: sql<string[]>`array_agg((${datasourceValues.data}->>${datasources.valueColumn})::text)`,
            })
                .from(datasources)
                .leftJoin(datasourceValues,
                    and(
                        eq(datasourceValues.datasourceId, datasources.id),
                        inArray(datasourceValues.id, [source.datasourceValueId!])
                    )
                )
                .where(eq(datasources.id, source.datasourceId as number))
                .groupBy(datasources.id)

            prompt.push(`<Datasource>${source.datasourcePrompt}: ${ds.data.join(", ")}</Datasource>`)
        }
    }

    return prompt.join("\n")
}
const processBrand = async (id: string) => {
    const scaleMap = ["price", "quality", "focus", "design", "positioning", "origin", "heritage", "recognition", "revenue"]

    const [brand] = await db.select().from(brandWithScales).where(eq(brandWithScales.integrationId, id))

    const brandHeaderInformation = `<BrandName>${brand.name}</BrandName><BrandMetaData>${JSON.stringify(brand.config)}</BrandMetaData>`
    const brandScaleInformation = `<BrandScales>${scaleMap.map(s => `<Scale>${s}:${brand[s]}/5</Scale>`).join("\n")}</BrandScales>`
    const brandCharacteristics = `<BrandCharacteristics>${brand.characteristic?.map(c => `<Characteristic>${c.value}</Characteristic>`).join("\n")}</BrandCharacteristics>`

    return `<Brand>${brandHeaderInformation}${brandScaleInformation}${brandCharacteristics}</Brand>`
}
const processCategory = async (id: string) => {
    const [category] = await db.select()
        .from(categories)
        .leftJoin(contents, and(eq(contents.entityId, categories.integrationId), eq(contents.entityType, "category")))
        .where(eq(categories.integrationId, id))

    const categoryHeaderInformation = `<CategoryName>${category.categories.name}</CategoryName>`
    const categoryMetaData = category.contents ? `<CategoryMetaData>${JSON.stringify(category.contents.config)}</CategoryMetaData>` : undefined

    return `<Category>${categoryHeaderInformation}${categoryMetaData}</Category>`
}
const processCombination = async (id: string) => {
    const [combination] = await db.select()
        .from(combinations)
        .leftJoin(contents, and(eq(contents.entityId, combinations.integrationId), eq(contents.entityType, "combination")))
        .where(eq(combinations.integrationId, id))

    const brand = await processBrand(combination.combinations.brandId!)
    const category = await processCategory(combination.combinations.categoryId!)

    return brand + category
}