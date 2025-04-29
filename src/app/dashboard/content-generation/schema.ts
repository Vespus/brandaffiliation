import {z} from "zod";

export const ContentGenerationStep1Schema = z.object({
    brand: z.number({message: "Please select a brand"}),
    season: z.string().min(1, {message: "Please select a season"}),
    category: z.string().min(1, {message: "Please select a category"}),
})

export const ContentGenerateSchema = z.object({
    ...ContentGenerationStep1Schema.shape,
    aiModel: z.string().min(1, {message: "Please select an AI model"}),
    customPrompt: z.string().optional(),
})