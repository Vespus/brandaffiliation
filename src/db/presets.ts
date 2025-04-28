import {createClient} from "@/db/supabase";
import {db} from "@/db/index";
import {and, eq, sql} from "drizzle-orm";
import {aiSettingsDefault, aiSettingsUser} from "@/db/schema";

export type AISetting = {
    id: number,
    model: string;
    temperature: number;
    topP: number;
    maxTokens: number;
    frequencyPenalty: number;
    presencePenalty: number;
    prompt: string;
}

export const getAISettings = async (model?: string) => {
    const user = await (await createClient()).auth.getUser();

    const query = db.select({
        id: aiSettingsUser.id,
        model: aiSettingsDefault.model,
        temperature: sql`coalesce(${aiSettingsUser.temperature}, ${aiSettingsDefault.temperature})`.as('temperature'),
        topP: sql`coalesce(${aiSettingsUser.topP}, ${aiSettingsDefault.topP})`.as('top_p'),
        maxTokens: sql`coalesce(${aiSettingsUser.maxTokens}, ${aiSettingsDefault.maxTokens})`.as('max_tokens'),
        frequencyPenalty: sql`coalesce(${aiSettingsUser.frequencyPenalty}, ${aiSettingsDefault.frequencyPenalty})`.as('frequency_penalty'),
        presencePenalty: sql`coalesce(${aiSettingsUser.presencePenalty}, ${aiSettingsDefault.presencePenalty})`.as('presence_penalty'),
        prompt: sql`coalesce(${aiSettingsUser.prompt}, ${aiSettingsDefault.prompt})`.as('prompt'),
    })
    .from(aiSettingsDefault)
    .leftJoin(aiSettingsUser, and(
        eq(aiSettingsUser.model, aiSettingsDefault.model),
        !user.error ? eq(aiSettingsUser.userId, user.data.user.id) : undefined
    ))

    if(model){
        query.where(eq(aiSettingsDefault.model, model))
    }

    const result = await query
    if(model){
        return result[0] as AISetting || null
    }

    return result as AISetting[] || null
}

export const getDefaultSettings = async (model?: string) => {
    const query = db.select({
        id: aiSettingsDefault.id,
        model: aiSettingsDefault.model,
        temperature: aiSettingsDefault.temperature,
        topP: aiSettingsDefault.topP,
        maxTokens: aiSettingsDefault.maxTokens,
        frequencyPenalty: aiSettingsDefault.frequencyPenalty,
        presencePenalty: aiSettingsDefault.presencePenalty,
        prompt: aiSettingsDefault.prompt,
    }).from(aiSettingsDefault)

    if(model){
        query.where(eq(aiSettingsDefault.model, model))
    }

    const result = await query
    if(model){
        return result[0] as AISetting || null
    }

    return result as AISetting[] || null
}