"use client"

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { env } from "@/env";
import { authClient } from "@/lib/auth-client";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string()
})

export const SignupForm = () => {
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState("");

    const captchaRef = useRef(null);

    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: '',
            name: ""
        },
    })

    const onSubmit = async ({name, email, password}: z.infer<typeof loginSchema>) => {
        setLoading(true);

        await authClient.signUp.email({
            email, // user email address
            password, // user password -> min 8 characters by default
            name, // user display name
            fetchOptions: {
                headers: {
                    "x-captcha-response": token
                }
            },
            callbackURL: "/dashboard",
        }, {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            onResponse: () => {
                setLoading(false);
            },
            onSuccess: () => {
                toast.success('Account created successfully. Check your email for verification.');
            },
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            onError: (ctx) => {
                toast.error(ctx.error.message)
            },
        });
    }

    const onLoad = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        captchaRef.current!.execute();
    };

    return (
        <Form {...form} >
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex flex-col">
                <FormField
                    control={form.control}
                    name="name"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter your name" autoComplete="name" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter your email address" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input placeholder="*********" type="password" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <HCaptcha
                    sitekey={env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
                    onLoad={onLoad}
                    languageOverride="auto"
                    onVerify={(token) => setToken(token)}
                    ref={captchaRef}
                />
                <Button type="submit" loading={loading || !captchaRef} className="w-full">Sign Up</Button>
            </form>
        </Form>
    )
}