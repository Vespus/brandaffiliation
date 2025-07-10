import { z } from "zod";

export const BatchContentGenerateSchema = z.object({
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