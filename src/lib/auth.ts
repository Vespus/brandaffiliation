import { db } from "@/db";
import * as schema from "@/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { Resend } from 'resend';
import { VerificationEmail } from "@/lib/emails/verification-email";
import { captcha } from "better-auth/plugins";

const resend = new Resend("re_SFCA4zkL_DoScwtVxwMBajhkn1P6r4BEw");

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema: {
            ...schema,
            user: schema.users,
        }
    }),
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
                react: VerificationEmail({ url }) as React.ReactElement,
            });
        },
        autoSignInAfterVerification: true,
        expiresIn: 3600
    },
    plugins: [
        nextCookies(),
        captcha({
            provider: "hcaptcha", // or google-recaptcha, hcaptcha
            secretKey: process.env.HCATPCHA_TOKEN!,
        }),
    ]
})