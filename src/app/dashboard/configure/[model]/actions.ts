"use server"

import {actionClient} from "@/lib/action-client";
import {AISettingsSaveSchema} from "@/app/dashboard/configure/[model]/schema";
import {db} from "@/db";
import {aiSettingsUser} from "@/db/schema";
import {createClient} from "@/db/supabase";
import {revalidatePath} from "next/cache";

export const saveSettingsAction = actionClient
    .schema(AISettingsSaveSchema)
    .action(async ({parsedInput: {id, ...data}}) => {
        const {error, data: user} = await (await createClient()).auth.getUser();

        if(error){
            throw error
        }

        await db.transaction(async (tx) => {
            if(id){
                await tx.update(aiSettingsUser).set({
                    id,
                    userId: user.user.id,
                    ...data,
                })
            }else{
                await tx.insert(aiSettingsUser).values({
                    userId: user.user.id,
                    ...data,
                })
            }
        })

        revalidatePath('/dashboard/configure', 'layout')
    })