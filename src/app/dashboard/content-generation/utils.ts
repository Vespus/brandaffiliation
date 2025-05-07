import {AIModelWithProvider, BrandWithCharacteristicAndScales} from "@/db/schema";
import {getTranslations, getFormatter, getLocale} from 'next-intl/server';
import {createOpenAI, openai} from "@ai-sdk/openai";
import {createAnthropic} from "@ai-sdk/anthropic";
import {db} from "@/db";
import {roundBothWays} from "@/utils/round-both-ways";

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
    const format = await getFormatter({locale})
    const scales = await db.query.scales.findMany()

    const featuresMap = new Map()

    if(brand.characteristic){
        featuresMap.set("Markenattribute", format.list(brand.characteristic?.map(x => x.value)))
    }

    scales.forEach((scale) => {
        const brandScale = brand[scale.label as keyof BrandWithCharacteristicAndScales] as number
        if(brandScale){
            const values = format.list(
                roundBothWays(brandScale).map(x => t(`scale_value.${scale.label}_${x}`))
            )
            featuresMap.set(t(`scale.${scale.label}`), values)
        }
    })


    const brandFeatures = [...featuresMap].map(([key, value]) => `- ${key}: ${value}`).join("\n\t")

    return prompt
        .replace("{category}", category)
        .replace("{season}", season)
        .replace("{brand}", brand.name)
        .replace("{brandFeatures}", brandFeatures)
}