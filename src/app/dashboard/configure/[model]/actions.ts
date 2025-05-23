"use server"

import { actionClient } from "@/lib/action-client";
import { AISettingsSaveSchema } from "@/app/dashboard/configure/[model]/schema";
import { db } from "@/db";
import { aiSettingsUser } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/get-user";

export const saveSettingsAction = actionClient
    .schema(AISettingsSaveSchema)
    .action(async ({parsedInput: {id, ...data}}) => {
        const {user} = await getUser()

        await db.transaction(async (tx) => {
            if (id) {
                await tx.update(aiSettingsUser).set({
                    id,
                    userId: user.id,
                    ...data,
                })
            } else {
                await tx.insert(aiSettingsUser).values({
                    userId: user.id,
                    ...data,
                })
            }
        })

        revalidatePath('/dashboard/configure', 'layout')
    })