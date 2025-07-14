"use server"

import { actionClient } from "@/lib/action-client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";

export const changeStore = actionClient
    .inputSchema(z.object({
        storeId: z.string().optional(),
    }))
    .action(async ({parsedInput: {storeId}}) => {
        const cookieList = await cookies()
        if(!storeId){
            cookieList.delete('qs-pay-store-id')
        }else {
            cookieList.set('qs-pay-store-id', storeId, {
                expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365)
            })
        }

        revalidatePath('/', 'layout')
    })