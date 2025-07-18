import {getDriver} from "@/app/dashboard/content-generation/utils";
import {db} from "@/db";
import {getAIModelsWithProviderAndSettings} from "@/db/presets";
import {
    brandWithScales,
    categories,
    combinations,
    contents,
    datasources,
    datasourceValues,
    systemPrompts,
    tasks
} from "@/db/schema";
import {generateObject} from "ai";
import {and, eq, inArray, sql} from "drizzle-orm";
import {NextRequest, NextResponse} from "next/server";
import z from "zod";
import {BatchContentGenerateSchemaType} from "@/app/dashboard/batch-studio/schema";
import {MetaOutputSchema} from "@/app/dashboard/content-generation/types";
import {revalidatePath} from "next/cache";

export const maxDuration = 30;

const bodySchema = z.object({
    taskId: z.number()
})

export const POST = async (req: NextRequest) => {
    const {data: context} = bodySchema.safeParse(await req.json())

    if (!context) {
        throw new Error("Invalid request")
    }

    const [task] = await db.select().from(tasks).where(eq(tasks.id, context.taskId))
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

    if (task.entityType === "category") {
        userPrompt.push(await processCategory(task.entityId as string))
    }

    if (task.entityType === "combination") {
        userPrompt.push(await processCombination(task.entityId as string))
    }

    userPrompt.push(await handleDataSources({dataSources: specifications.dataSources}))
    await db.update(tasks).set({status: "inProgress"}).where(eq(tasks.id, task.id))

    try {
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

        const [currentConfig] = await db.select().from(contents).where(and(eq(contents.entityId, task.entityId), eq(contents.entityType, task.entityType)))
        if (currentConfig) {
            await db.update(contents).set({
                config: object,
                oldConfig: currentConfig.config,
                needsReview: true
            }).where(and(eq(contents.entityId, task.entityId), eq(contents.entityType, task.entityType)))
        } else {
            await db.insert(contents).values({
                entityId: task.entityId,
                entityType: task.entityType,
                config: object,
                oldConfig: null,
                needsReview: true
            })
        }
    } catch (e) {
        await db.update(tasks).set({status: "failed"}).where(eq(tasks.id, task.id))
        throw e
    }

    await db.delete(tasks).where(eq(tasks.id, task.id))

    revalidatePath('/', 'layout')
    return NextResponse.json({status: "ok"})
}

const handleDataSources = async ({dataSources}: Pick<BatchContentGenerateSchemaType, "dataSources">) => {
    const queryableDataSources = dataSources?.filter(ds => ds.datasourceId)
    const prompt: string[] = []
    if (queryableDataSources) {
        for await (const source of queryableDataSources) {
            const [ds] = await db.select({
                name: datasources.name,
                description: datasources.description,
                data: sql<string[]>`array_agg
                ((
                ${datasourceValues.data}
                -
                >>
                ${datasources.valueColumn}
                )
                :
                :
                text
                )`,
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