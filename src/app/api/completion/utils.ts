import {AIModelWithProvider, BrandWithCharacteristic} from "@/db/schema";
import {createOpenAI, openai} from "@ai-sdk/openai";
import {createAnthropic} from "@ai-sdk/anthropic";
import {
    designLabels,
    fameLabels,
    focusLabels,
    heritageLabels,
    originLabels,
    positioningLabels,
    priceLabels,
    qualityLabels,
    salesVolumeLabels
} from "@/utils/scales";

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

export const formatPrompt = ({category, season, brand, prompt}: {
    category: string,
    season: string,
    brand: BrandWithCharacteristic,
    prompt: string
}) => {
    const brandScales = {
        "Preis": brand.price ? priceLabels[brand.price] : "Unbekannt",
        "Qualität": brand.quality ? qualityLabels[brand.quality] : "Unbekannt",
        "Schwerpunkt": brand.focus ? focusLabels[brand.focus] : "Unbekannt",
        "Design": brand.design ? designLabels[brand.design] : "Unbekannt",
        "Positionierung": brand.positioning ? positioningLabels[brand.positioning] : "Unbekannt",
        "Heritage": brand.heritage ? heritageLabels[brand.heritage] : "Unbekannt",
        "Herkunft": brand.origin ? originLabels[brand.origin] : "Unbekannt",
        "Bekanntheit": brand.fame ? fameLabels[brand.fame] : "Unbekannt",
        "Umsatz": brand.sales_volume ? salesVolumeLabels[brand.sales_volume] : "Unbekannt",
    }
    const brandFeatures = `
    - Markenattribute: ${brand.characteristic?.map(x => x.value).join(", ")}
    ${Object.entries(brandScales).map(([key, value]) => `- ${key}: ${value}`).join("\n\t")}
    `
    return prompt
        .replace("{category}", category)
        .replace("{season}", season)
        .replace("{brand}", brand.name)
        .replace("{brandFeatures}", brandFeatures)
}