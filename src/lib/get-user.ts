import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cache } from "react";

type Session = typeof auth.$Infer.Session;

export const getUser = cache(async (): Promise<Session> => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if(!session){
        redirect("/auth/sign-in")
    }

    return session
})