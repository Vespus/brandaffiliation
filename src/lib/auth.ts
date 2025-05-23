import { db } from "@/db";
import * as schema from "@/db/schema";
import { env } from "@/env";
import { VerificationEmail } from "@/lib/emails/verification-email";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import React from "react";
import { Resend } from 'resend';

const resend = new Resend("re_SFCA4zkL_DoScwtVxwMBajhkn1P6r4BEw");

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema: {
            ...schema,
            user: schema.users,
        }
    }),
    secret: env.BETTER_AUTH_SECRET,
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: true,
    },
    emailVerification: {
        sendOnSignUp: true,
        sendVerificationEmail: async ({user, url}) => {
            await resend.emails.send({
                from: 'Acme <onboarding@resend.dev>',
                to: user.email,
                subject: "BrandAffiliation Verification Email",
                react: VerificationEmail({url}) as React.ReactElement,
            });
        },
        autoSignInAfterVerification: true,
        expiresIn: 3600
    },
    plugins: [
        nextCookies()
    ]
})