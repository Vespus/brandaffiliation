'use client'

import { useRef, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string(),
})

export const SignupForm = () => {
    const [loading, setLoading] = useState(false)

    const captchaRef = useRef(null)

    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
            name: '',
        },
    })

    const onSubmit = async ({ name, email, password }: z.infer<typeof loginSchema>) => {
        setLoading(true)

        await authClient.signUp.email(
            {
                email, // user email address
                password, // user password -> min 8 characters by default
                name, // user display name
                callbackURL: '/dashboard',
            },
            {
                onResponse: () => {
                    setLoading(false)
                },
                onSuccess: () => {
                    toast.success('Account created successfully. Check your email for verification.')
                },

                onError: (ctx) => {
                    toast.error(ctx.error.message)
                },
            }
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter your name" autoComplete="name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter your email address" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input placeholder="*********" type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" loading={loading || !captchaRef} className="w-full">
                    Sign Up
                </Button>
            </form>
        </Form>
    )
}
