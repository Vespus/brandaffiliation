import {ContentGenerateSchema} from "@/app/dashboard/content-generation/schema";
import {NextResponse} from "next/server";
import {db} from "@/db";
import {eq} from "drizzle-orm";
import {aiModels, brand as brandTable, BrandWithCharacteristic} from "@/db/schema";
import {AISetting, getAISettings} from "@/db/presets";
import {streamText} from "ai";
import {formatPrompt, getDriver} from "@/app/api/completion/utils";

export const POST = async (request: Request) => {
    const body = await request.json()
    const parsed = ContentGenerateSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({message: parsed.error.message}, {status: 400})
    }
    const {data} = parsed

    const [model, brand] = await Promise.all([
        db.query.aiModels.findFirst({
            where: eq(aiModels.id, data.aiModel),
            with: {
                provider: true
            }
        }),
        db.query.brand.findFirst({
            where: eq(brandTable.id, data.brand),
            with: {
                characteristic: true
            }
        }),
    ])

    if (!model) {
        return NextResponse.json({message: "Model or brand not found"}, {status: 404})
    }

    const AISettings = await getAISettings(model.modelName) as AISetting
    const driver = getDriver(model)

    const result = streamText({
        model: driver,
        maxTokens: AISettings.maxTokens,
        temperature: AISettings.temperature,
        topP: AISettings.topP,
        frequencyPenalty: AISettings.frequencyPenalty,
        presencePenalty: AISettings.presencePenalty,
        messages: [
            {
                role: 'user',
                content: formatPrompt({
                    category: data.category,
                    season: data.season,
                    brand: brand as BrandWithCharacteristic,
                    prompt: AISettings.prompt
                })
            }
        ],
    });

    return result.toTextStreamResponse();
}

