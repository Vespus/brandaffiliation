"use server"

import {actionClient} from "@/lib/action-client";
import {createClient} from "@/db/supabase";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";

export const handleLogoutAction = actionClient
    .action(async () => {
        const {error} = await (await createClient()).auth.signOut()
        if(error){
            throw error
        }

        revalidatePath('', 'layout')
        redirect("/auth/sign-in")
    })