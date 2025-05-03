"use server";

import {encodedRedirect} from "@/utils/encoded-redirect";
import {createClient} from "@/utils/supabase/server";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {actionClient} from "@/lib/action-client";
import {z} from "zod";

export const signUpAction = actionClient
    .schema(z.object({
        email: z.string().email(),
        password: z.string().min(8),
    }))
    .action(async ({parsedInput: {email, password}}) => {
        const supabase = await createClient();
        function getRootURL() {
            let url =
                process?.env?.NEXT_PUBLIC_ROOT_DOMAIN_URL ?? // Set this to your site URL in production env.
                process?.env?.NEXT_PUBLIC_VERCEL_BRANCH_URL ?? // Automatically set by Vercel.
                process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
                "http://localhost:3000";
            // Make sure to include `https://` when not localhost.
            url = url.includes("http") ? url : `https://${url}`;
            // Make sure to include a trailing `/`.
            url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;
            return url;
        }

        const {error} = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: getRootURL(),
            },
        });

        if (error) {
            console.error(error.code + " " + error.message);
            throw error;
        } else {
            return encodedRedirect(
                "success",
                "/auth/sign-up",
                "Thanks for signing up! Please check your email for a verification link.",
            );
        }
    })


export const signInAction = actionClient
    .schema(z.object({
        email: z.string().email(),
        password: z.string().min(8),
    }))
    .action(async ({parsedInput: {email, password}}) => {
        const supabase = await createClient();

        const {error} = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw error;
        }

        return redirect("/dashboard");
    })

export const forgotPasswordAction = async (formData: FormData) => {
    const email = formData.get("email")?.toString();
    const supabase = await createClient();
    const origin = (await headers()).get("origin");
    const callbackUrl = formData.get("callbackUrl")?.toString();

    if (!email) {
        return encodedRedirect("error", "/forgot-password", "Email is required");
    }

    const {error} = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
    });

    if (error) {
        console.error(error.message);
        return encodedRedirect(
            "error",
            "/forgot-password",
            "Could not reset password",
        );
    }

    if (callbackUrl) {
        return redirect(callbackUrl);
    }

    return encodedRedirect(
        "success",
        "/forgot-password",
        "Check your email for a link to reset your password.",
    );
};

export const resetPasswordAction = async (formData: FormData) => {
    const supabase = await createClient();

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!password || !confirmPassword) {
        encodedRedirect(
            "error",
            "/protected/reset-password",
            "Password and confirm password are required",
        );
    }

    if (password !== confirmPassword) {
        encodedRedirect(
            "error",
            "/protected/reset-password",
            "Passwords do not match",
        );
    }

    const {error} = await supabase.auth.updateUser({
        password: password,
    });

    if (error) {
        encodedRedirect(
            "error",
            "/protected/reset-password",
            "Password update failed",
        );
    }

    encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return redirect("/sign-in");
};