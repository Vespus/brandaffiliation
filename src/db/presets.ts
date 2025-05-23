import { db } from "@/db/index";
import { auth } from "@/lib/auth";
import { getUser } from "@/lib/get-user";
import { and, eq, getTableColumns, inArray, sql } from "drizzle-orm";
import {
    aiModels,
    aiProviders,
    aiSettingsDefault,
    aiSettingsUser,
} from "@/db/schema";
import { AIModelWithProviderAndSettings, AIProvider, AISetting } from "./types";
import { headers } from "next/headers";

export const getAISettings = async (model?: string) => {
    //todo get user.
    const session = await auth.api.getSession({
        headers: await headers()
    })

    const query = db.select({
        id: aiSettingsUser.id,
        model: aiSettingsDefault.model,
        temperature: sql`coalesce
            (${aiSettingsUser.temperature}, ${aiSettingsDefault.temperature})`.as('temperature'),
        topP: sql`coalesce
            (${aiSettingsUser.topP}, ${aiSettingsDefault.topP})`.as('top_p'),
        maxTokens: sql`coalesce
            (${aiSettingsUser.maxTokens}, ${aiSettingsDefault.maxTokens})`.as('max_tokens'),
        frequencyPenalty: sql`coalesce
            (${aiSettingsUser.frequencyPenalty}, ${aiSettingsDefault.frequencyPenalty})`.as('frequency_penalty'),
        presencePenalty: sql`coalesce
            (${aiSettingsUser.presencePenalty}, ${aiSettingsDefault.presencePenalty})`.as('presence_penalty'),
    })
        .from(aiSettingsDefault)
        .leftJoin(aiSettingsUser, and(
            eq(aiSettingsUser.model, aiSettingsDefault.model),
            session?.user ? eq(aiSettingsUser.userId, session.user.id) : undefined
        ))

    if (model) {
        query.where(eq(aiSettingsDefault.model, model))
    }

    const result = await query
    if (model) {
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
    }).from(aiSettingsDefault)

    if (model) {
        query.where(eq(aiSettingsDefault.model, model))
    }

    const result = await query
    if (model) {
        return result[0] as AISetting || null
    }

    return result as AISetting[] || null
}

export const getAIModelsWithProviderAndSettings = async (models: number[]): Promise<AIModelWithProviderAndSettings[]> => {
    const {user} = await getUser();

    const query = db
        .select({
            ...getTableColumns(aiModels),
            provider: sql<AIProvider>`jsonb_build_object
            ('id', ${aiProviders.id},'name', ${aiProviders.name},'code', ${aiProviders.code},'key', ${aiProviders.key},'createdAt', ${aiProviders.createdAt})`,
            settings: sql<AISetting>`jsonb_build_object
            ('model', ${aiSettingsDefault.model},'temperature', COALESCE (${aiSettingsUser.temperature}, ${aiSettingsDefault.temperature}),'topP', COALESCE (${aiSettingsUser.topP}, ${aiSettingsDefault.topP}),'maxTokens', COALESCE (${aiSettingsUser.maxTokens}, ${aiSettingsDefault.maxTokens}),'frequencyPenalty', COALESCE (${aiSettingsUser.frequencyPenalty}, ${aiSettingsDefault.frequencyPenalty}),'presencePenalty', COALESCE (${aiSettingsUser.presencePenalty}, ${aiSettingsDefault.presencePenalty}))`
        })
        .from(aiModels)
        .innerJoin(aiSettingsDefault, eq(aiModels.modelName, aiSettingsDefault.model))
        .leftJoin(
            aiSettingsUser,
            and(
                eq(aiSettingsDefault.model, aiSettingsUser.model),
                user ? eq(aiSettingsUser.userId, user.id) : undefined
            )
        )
        .innerJoin(aiProviders, eq(aiModels.providerId, aiProviders.id))
        .where(inArray(aiModels.id, models));

    return await query;
}