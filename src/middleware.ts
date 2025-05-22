import type { auth } from "@/lib/auth";
import { type NextRequest, NextResponse } from "next/server";

type Session = typeof auth.$Infer.Session;

export default async function middleware(request: NextRequest) {


    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',

    ],
};