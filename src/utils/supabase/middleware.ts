import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import {env} from "@/env";

export const updateSession = async (request: NextRequest) => {
    try {
        let response = NextResponse.next({
            request: {
                headers: request.headers,
            },
        });

        const supabase = createServerClient(
            env.NEXT_PUBLIC_SUPABASE_URL!,
            env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) =>
                            request.cookies.set(name, value),
                        );
                        response = NextResponse.next({
                            request,
                        });
                        cookiesToSet.forEach(({ name, value, options }) =>
                            response.cookies.set(name, value, options),
                        );
                    },
                },
            },
        );

        // This will refresh session if expired - required for Server Components
        // https://supabase.com/docs/guides/auth/server-side/nextjs
        const user = await supabase.auth.getUser();
        const pathname = request.nextUrl.pathname;
        // protected routes
        if (!pathname.startsWith('/auth') && user.error) {
            return NextResponse.redirect(new URL("/auth/sign-in", request.url));
        }

        if (request.nextUrl.pathname === "/" && !user.error) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }

        return response;
    } catch (e) {
        console.error(e)
        // If you are here, a Supabase client could not be created!
        // This is likely because you have not set up environment variables.
        // Check out http://localhost:3000 for Next Steps.
        return NextResponse.next({
            request: {
                headers: request.headers,
            },
        });
    }
};