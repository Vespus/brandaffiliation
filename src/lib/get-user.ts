import { headers } from "next/headers";
import { auth } from "@/lib/auth";

type Session = typeof auth.$Infer.Session;

export const getUser = async (): Promise<Session> => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if(!session){
        throw new Error('Unauthorized')
    }

    return session
}