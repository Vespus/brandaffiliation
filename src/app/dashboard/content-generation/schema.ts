import { z } from "zod";

export const ContentGenerateSchema = z.object({
    prompt: z.number(),
    brand: z.string().optional(),
    category: z.string().optional(),
    aiModel: z.array(z.number().min(1, {message: "Please select an AI model"}),),
    dataSources: z.array(
        z.object({
            datasourceId: z.number().optional(),
            datasourceValueId: z.number().optional(),
            datasourcePrompt: z.string().optional(),
        })
    ).optional()
}).refine(
    (data) => data.brand !== undefined || data.category !== undefined,
    {
        message: "Either Brand or Category must be provided",
        path: ["category"],
    },
)