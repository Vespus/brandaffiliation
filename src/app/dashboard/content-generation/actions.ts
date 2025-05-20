"use server"

import {ContentGenerateSchema} from "@/app/dashboard/content-generation/schema";
import {getAIModelsWithProviderAndSettings} from "@/db/presets";
import {db} from "@/db";
import {brandWithScales} from "@/db/schema";
import {eq} from "drizzle-orm";
import {createStreamableValue, StreamableValue} from "ai/rsc";
import {formatPrompt, getDriver} from "@/app/dashboard/content-generation/utils";
import {streamText} from "ai";
import {z} from "zod";

export const CompletionStream = async (parsedInput: z.infer<typeof ContentGenerateSchema>) => {
    const [models, [brand]] = await Promise.all([
        getAIModelsWithProviderAndSettings(parsedInput.aiModel),
        db.select()
            .from(brandWithScales)
            .where(eq(brandWithScales.id, parsedInput.brand))
            .limit(1)
    ])

    if (!models.length) {
        throw new Error("Model not found")
    }

    const streamableValues: Map<number, ReturnType<typeof createStreamableValue<string, string>>> = new Map();
    // Initialize streamable values for each model
    models.forEach(model => {
        streamableValues.set(model.id, createStreamableValue<string, string>(''));
    })

    Promise.all(models.map(async (model) => {
        try {
            const driver = getDriver(model)
            const stream = streamText({
                model: driver,
                maxTokens: model.settings.maxTokens,
                temperature: model.settings.temperature,
                topP: model.settings.topP,
                frequencyPenalty: model.settings.frequencyPenalty,
                presencePenalty: model.settings.presencePenalty,
                messages: [
                    {
                        role: 'user',
                        content: await formatPrompt({
                            category: parsedInput.category,
                            season: parsedInput.season,
                            prompt: parsedInput.customPrompt,
                            brand
                        })
                    }
                ],
            });

            for await (const chunk of stream.fullStream) {
                // Update this model's value in the combined object
                if(chunk.type === "finish"){
                    streamableValues.set(model.id, streamableValues.get(model.id)!.done());
                }
                if(chunk.type === "text-delta"){
                    streamableValues.set(model.id, streamableValues.get(model.id)!.update(chunk.textDelta));
                }
            }
        } catch (error) {
            // Handle errors for this model
            streamableValues.set(model.id, streamableValues.get(model.id)!.append(`\n[Error: ${(error as Error).message}]`));
        }
    }))

    return {
        aiModelList: models,
        streams: [...streamableValues].reduce<Record<number, StreamableValue<string>>>((acc, [modelId, streamableValue]) => {
            acc[modelId] = streamableValue.value;
            return acc
        }, {})
    }
}