import { z } from "zod";

export const BatchContentGenerateSchema = z.object({
    prompt: z.number(),
    aiModel: z.number({message: "Please select an AI model"}),
    useBrandContent: z.boolean().optional(),
    useCategoryContent: z.boolean().optional(),
    userPromptPrefix: z.string().optional(),
    dataSources: z.array(
        z.object({
            datasourceId: z.number().optional(),
            datasourceValueId: z.number().optional(),
            datasourcePrompt: z.string().optional(),
        })
    ).optional()
})

export type BatchContentGenerateSchemaType = z.infer<typeof BatchContentGenerateSchema>