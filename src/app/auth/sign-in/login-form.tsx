"use client"

import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import Link from "next/link";
import {useCustomAction} from "@/hooks/use-custom-action";
import {signInAction} from "@/app/auth/actions";
import {z} from "zod";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
})

export const LoginForm = () => {
    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: ''
        },
    })

    const loginCallAction = useCustomAction(signInAction)

    return (
        <Form {...form} >
            <form onSubmit={form.handleSubmit(loginCallAction.execute)} className="space-y-4 flex flex-col">
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
                <Link
                    href="/auth/forgot-password"
                    className="text-sm text-muted-foreground self-end"
                >
                    Forgot Password?
                </Link>
                <Button type="submit" loading={loginCallAction.isPending} className="w-full">Continue</Button>
            </form>

        </Form>
    )
}