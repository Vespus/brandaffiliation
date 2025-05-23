"use client"

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
})

export const LoginForm = () => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: ''
        },
    })

    const onSubmit = async ({email, password}: z.infer<typeof loginSchema>) => {
        await authClient.signIn.email({
            email,
            password
        }, {
            onSuccess: () => {
                toast.success('Login successful');
                router.push('/dashboard');
            },
            onRequest: () => {
                setLoading(true);
            },
            onResponse: () => {
                setLoading(false);
            }
        })
    }

    return (
        <Form {...form} >
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex flex-col">
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
                            <div className="flex items-center">
                                <FormLabel htmlFor="password">Password</FormLabel>
                                <a
                                    href="#"
                                    className="ml-auto text-sm underline-offset-4 hover:underline"
                                >
                                    Forgot your password?
                                </a>
                            </div>
                            <FormControl>
                                <Input placeholder="*********" type="password" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <Button type="submit" loading={loading} className="w-full">Continue</Button>
                <div className="text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/sign-up" className="underline underline-offset-4">
                        Sign up
                    </Link>
                </div>
            </form>

        </Form>
    )
}