import type { auth } from "@/lib/auth";
import { type NextRequest, NextResponse } from "next/server";

type Session = typeof auth.$Infer.Session;

export default async function middleware(request: NextRequest) {
    const response = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
        headers: {
            cookie: request.headers.get('cookie') || ""
        }
    })
    const session = await response.json() as Session
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|public/|favicon.ico|robots.txt|sitemap.xml|manifest.json|.well-known).*)",
    ],
};