import { appendMarkdown, getDriver } from "@/app/dashboard/content-generation/utils";
import { db } from "@/db";
import { getAIModelsWithProviderAndSettings } from "@/db/presets";
import { datasources, datasourceValues, systemPrompts } from "@/db/schema";
import { streamObject } from "ai";
import { createStreamableValue } from "ai/rsc";
import { and, eq, inArray, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import z from "zod";

export const maxDuration = 30;

const bodySchema = z.object({
    prompt: z.number(),
    aiModel: z.number({message: "Please select an AI model"}),
    dataSources: z.array(
        z.object({
            datasourceId: z.number().optional(),
            datasourceValueId: z.number().optional(),
            datasourcePrompt: z.string().optional(),
        })
    ).optional()
})

export const POST = async (req: NextRequest) => {
    const {data: context} = bodySchema.safeParse(await req.json())

    if (!context) {
        throw new Error("Invalid request")
    }

    const [[model], prompt] = await Promise.all([
        getAIModelsWithProviderAndSettings([context.aiModel]),
        db.query.systemPrompts.findFirst({
            where: eq(systemPrompts.id, context.prompt)
        }),
    ])

    if (!model || !prompt) {
        throw new Error("Model not found")
    }

    let dataSourcePrompt = ""

    const queryableDataSources = context.dataSources?.filter(ds => ds.datasourceId)
    if (queryableDataSources) {
        for await (const source of queryableDataSources) {
            const [ds] = await db.select({
                name: datasources.name,
                description: datasources.description,
                data: sql<string[]>`array_agg
                    ((${datasourceValues.data} ->> ${datasources.valueColumn})::text)`,
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

            dataSourcePrompt = appendMarkdown(dataSourcePrompt, `${source.datasourcePrompt}: ${ds.data.join(", ")}`)
        }
    }
    const driver = getDriver(model);

    const {partialObjectStream} = streamObject({
        model: driver,
        maxTokens: model.settings.maxTokens,
        temperature: model.settings.temperature,
        topP: model.settings.topP,
        frequencyPenalty: model.settings.frequencyPenalty,
        presencePenalty: model.settings.presencePenalty,
        system: prompt.prompt,
        schema: z.object({
            hero_header: z.string().describe("Hero header of the SEO Text Content"),
            hero_description: z.string().describe("Hero description of the SEO Text Content with at least 2 long paragraphs"),
            meta_title: z.string().describe("Meta title of the generated SEO Text Content"),
            meta_description: z.string().describe("Meta description of the generated SEO Text Content"),
            meta_keywords: z.string().describe("Meta keywords of the generated SEO Text Content"),
        }),
        prompt: dataSourcePrompt
    })

    for await (const partialObject of partialObjectStream) {
        console.clear();
    }

}