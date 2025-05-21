/*
import {clerkMiddleware, createRouteMatcher} from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}*/

import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { auth } from "@/auth"

export default auth((req) => {
    // req.auth
})

export const config = {
    matcher: [

        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};