"use server"

import { actionClient } from "@/lib/action-client";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const handleLogoutAction = actionClient
    .action(async () => {
        const {success} = await auth.api.signOut({
            headers: await headers()
        })

        if (!success) {
            throw new Error("Failed to sign out")
        }

        revalidatePath('', 'layout')
        redirect("/auth/sign-in")
    })