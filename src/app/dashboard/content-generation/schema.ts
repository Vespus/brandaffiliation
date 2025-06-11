import { z } from "zod";

export const ContentGenerateSchema = z.object({
    prompt: z.number(),
    aiModel: z.array(z.number().min(1, {message: "Please select an AI model"}),),
    dataSources: z.array(
        z.object({
            datasourceId: z.number().optional(),
            datasourceValueId: z.number().optional(),
            datasourcePrompt: z.string().optional(),
        })
    ).optional()
})