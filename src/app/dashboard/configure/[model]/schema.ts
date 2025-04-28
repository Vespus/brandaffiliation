import {z} from "zod";

export const AISettingsSaveSchema = z.object({
    id: z.number().optional().nullable(),
    model: z.string(),
    temperature: z.number().min(0).max(2),
    maxTokens: z.number().min(1).max(32000),
    topP: z.number().min(0).max(1),
    frequencyPenalty: z.number().min(-2).max(2),
    presencePenalty: z.number().min(-2).max(2),
    prompt: z.string(),
})