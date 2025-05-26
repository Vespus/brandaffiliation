import { type NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|public/|favicon.ico|robots.txt|sitemap.xml|manifest.json|.well-known).*)",
    ],
    runtime: "nodejs",
};