import NextAuth, { CredentialsSignin, User } from 'next-auth';
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import Credentials from "@auth/core/providers/credentials";
import { compare } from "bcrypt-ts";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

class InvalidLoginError extends CredentialsSignin  {
    code = 'Invalid identifier or password'
}

export const {handlers, signIn, signOut, auth} = NextAuth({
    adapter: DrizzleAdapter(db),
    session: {
        strategy: "jwt"
    },
    providers: [
        Credentials({
            credentials: {
                email: {
                    type: "email",
                    label: "Email",
                },
                password: {
                    type: "password",
                    label: "Password",
                },
            },
            async authorize({email, password}: any) {
                const [user] = await db.select().from(users).where(eq(users.email, email));
                if (!user) {
                    throw new InvalidLoginError();
                }

                const passwordsMatch = await compare(password, user.password!);
                if (!passwordsMatch) {
                    throw new InvalidLoginError();

                }

                return user as User;
            },
        })
    ],
    pages: {
        signIn: "/auth/sign-in",
        newUser: "/auth/sign-up"
    },
    callbacks: {
        async signIn(userDetail) {
            return Object.keys(userDetail).length !== 0;
        },
        async redirect({ baseUrl }) {
            return `${baseUrl}/dashboard`;
        },
        async session({session, user, token}) {
            if(session.user?.name) session.user.name = token.name
            return session
        },
        async jwt({ token, user }) {
            const newUser = { ...user } as any;
            if (newUser.first_name && newUser.last_name)
                token.name = `${newUser.first_name} ${newUser.last_name}`;
            return token;
        },
    },
    trustHost: true
})