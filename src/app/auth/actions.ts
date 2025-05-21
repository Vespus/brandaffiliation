"use server";

import {encodedRedirect} from "@/utils/encoded-redirect";
import {createClient} from "@/utils/supabase/server";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {actionClient} from "@/lib/action-client";
import {z} from "zod";
import { signIn } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { genSaltSync, hashSync } from "bcrypt-ts";

export const signUpAction = actionClient
    .schema(z.object({
        email: z.string().email(),
        password: z.string().min(8),
    }))
    .action(async ({parsedInput: {email, password}}) => {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        if(user){
            throw new Error("A user with this identifier already exists")
        }

        const salt = genSaltSync(10);
        const hash = hashSync(password, salt);

        await db.insert(users).values({ email: email, password: hash });

        return encodedRedirect(
            "success",
            "/auth/sign-in",
            "Thanks for signing up! Please check your email for a verification link.",
        );
    })


export const signInAction = actionClient
    .schema(z.object({
        email: z.string().email(),
        password: z.string().min(8),
    }))
    .action(async ({parsedInput: {email, password}}) => {
        const {error} = await signIn("credentials", {email, password});

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