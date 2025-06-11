"use server"

import { ContentGenerateSchema } from "@/app/dashboard/content-generation/schema";
import { appendMarkdown, getDriver } from "@/app/dashboard/content-generation/utils";
import { db } from "@/db";
import { getAIModelsWithProviderAndSettings } from "@/db/presets";
import { datasources, datasourceValues, systemPrompts } from "@/db/schema";
import { streamObject } from "ai";
import { createStreamableValue, StreamableValue } from "ai/rsc";
import { and, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";

export const CompletionStream = async (parsedInput: z.infer<typeof ContentGenerateSchema>) => {
    const [models, prompt] = await Promise.all([
        getAIModelsWithProviderAndSettings(parsedInput.aiModel),
        db.query.systemPrompts.findFirst({
            where: eq(systemPrompts.id, parsedInput.prompt)
        }),
    ])

    if (!models.length || !prompt) {
        throw new Error("Model not found")
    }

    let dataSourcePrompt = ""

    const queryableDataSources = parsedInput.dataSources?.filter(ds => ds.datasourceId)
    if (queryableDataSources) {
        for await (const source of queryableDataSources) {
            const [ds] = await db.select({
                name: datasources.name,
                description: datasources.description,
                data: sql<string[]>`array_agg
                    ((${datasourceValues.data} ->> ${datasources.valueColumn}):: text)`,
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

    const streamList = new Map(models.map((model) => ([model.id, createStreamableValue()])));

    Promise.all(models.map(async (model) => {
        const driver = getDriver(model)

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
            streamList.set(model.id, streamList.get(model.id)!.update(partialObject));
        }

        streamList.set(model.id, streamList.get(model.id)!.done())
    }))

    return {
        aiModelList: models,
        streams: [...streamList].reduce<Record<string, StreamableValue<string>>>((acc, [id, stream]) => {
            acc[id] = stream.value;
            return acc;
        }, {}),
    }
}