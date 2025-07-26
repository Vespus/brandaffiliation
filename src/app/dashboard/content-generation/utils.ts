import { AIModelWithProvider, BrandWithCharacteristicAndScales } from "@/db/types";
import { roundBothWays } from "@/utils/round-both-ways";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI, openai } from "@ai-sdk/openai";
import { get } from 'es-toolkit/compat';
import { getLocale, getTranslations } from 'next-intl/server';

export const getDriver = (modelWithProvider: AIModelWithProvider) => {
    switch (modelWithProvider.provider.code) {
        case "openai":
            const openaiProvider = createOpenAI({
                apiKey: modelWithProvider.provider.key
            })
            return openaiProvider(modelWithProvider.modelName)
        case "anthropic":
            const anthropicProvider = createAnthropic({
                apiKey: modelWithProvider.provider.key
            })
            return anthropicProvider(modelWithProvider.modelName)
    }

    return openai("gpt-4-turbo")
}

export const formatPrompt = async ({category, season, brand, prompt}: {
    category: string,
    season: string,
    brand: BrandWithCharacteristicAndScales,
    prompt: string
}) => {
    const locale = await getLocale();
    const t = await getTranslations({locale});
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {characteristic, id, slug, name, ...scales} = brand || {}

    const dataSource = {
        form: {
            season,
            category
        },
        brand: {
            name,
            scales: Object.entries(scales).map(([key, value], index) => {
                const andLabel = t("generic.and")
                const scaleLabel = t(`scale.${key}`)
                const scaleValues = roundBothWays(value as number || 0)
                const scaleLabels = scaleValues.map((v) => t(`scale_value.${key}_${v}`)).join(` ${andLabel} `)

                return `${index === 0 ? '\t' : ''}- ${scaleLabel}: ${scaleLabels}`
            }).join("\n\t"),
            characteristics: characteristic?.map((char, index) => `${index === 0 ? '\t' : ''}- ${char.value}`).join("\n\t"),
        }
    }

    return prompt.replace(/\{([a-zA-Z0-9_.]+)\}/g,
        (_, match: string) => {
            const value = get(dataSource, match)
            if (value) return value

            return _
        }
    )
}

export const appendMarkdown = (original: string, toAppend: string): string => {
    const trimmedOriginal = original.replace(/\n*$/, '\n');
    const ensuredToAppend = toAppend.endsWith('\n') ? toAppend : toAppend + '\n';
    return trimmedOriginal + ensuredToAppend;
}