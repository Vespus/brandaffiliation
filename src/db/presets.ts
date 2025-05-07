import {createClient} from "@/db/supabase";
import {db} from "@/db/index";
import {and, eq, getTableColumns, inArray, sql} from "drizzle-orm";
import {
    aiModels,
    AIModelWithProviderAndSettings,
    AISetting,
    aiSettingsDefault,
    aiSettingsUser, Provider,
    provider
} from "@/db/schema";

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

export const getAIModelsWithProviderAndSettings = async (models: number[]) : Promise<AIModelWithProviderAndSettings[]> => {
    const user = await (await createClient()).auth.getUser();

    const query = db
        .select({
            ...getTableColumns(aiModels),
            provider: sql<Provider>`jsonb_build_object('id', ${provider.id},'name', ${provider.name},'code', ${provider.code},'key', ${provider.key},'createdAt', ${provider.createdAt})`,
            settings: sql<AISetting>`jsonb_build_object('model', ${aiSettingsDefault.model},'temperature', COALESCE(${aiSettingsUser.temperature}, ${aiSettingsDefault.temperature}),'topP', COALESCE(${aiSettingsUser.topP}, ${aiSettingsDefault.topP}),'maxTokens', COALESCE(${aiSettingsUser.maxTokens}, ${aiSettingsDefault.maxTokens}),'frequencyPenalty', COALESCE(${aiSettingsUser.frequencyPenalty}, ${aiSettingsDefault.frequencyPenalty}),'presencePenalty', COALESCE(${aiSettingsUser.presencePenalty}, ${aiSettingsDefault.presencePenalty}),'prompt', COALESCE(${aiSettingsUser.prompt}, ${aiSettingsDefault.prompt}))`})
        .from(aiModels)
        .innerJoin(aiSettingsDefault, eq(aiModels.modelName, aiSettingsDefault.model))
        .leftJoin(
            aiSettingsUser,
            and(
                eq(aiSettingsDefault.model, aiSettingsUser.model),
                !user.error ? eq(aiSettingsUser.userId, user.data.user.id) : undefined
            )
        )
        .innerJoin(provider, eq(aiModels.providerId, provider.id))
        .where(inArray(aiModels.id, models));

    return await query;
}