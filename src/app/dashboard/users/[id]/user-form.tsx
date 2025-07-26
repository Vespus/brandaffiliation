"use client"

import { Button } from "@/components/ui/button";
import { CalendarWithTime } from "@/components/ui/calendar-with-time";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { differenceInSeconds, format, fromUnixTime, getUnixTime } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { User } from "better-auth";

export type UserWithRole = User & {
    role?: string;
    banned?: boolean | null;
    banReason?: string | null;
    banExpires?: Date | null;
}

const userSchema = z.object({
    role: z.string().min(1, "Role is required").max(50, "Role must be less than 50 characters"),
    banned: z.boolean(),
    banReason: z.string().optional(),
    banExpiresIn: z.number().optional(),
}).superRefine((data, ctx) => {
    if (data.banned && !data.banReason) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["banReason"],
            message: "Ban reason is required",
        })
    }
    if (data.banned && !data.banExpiresIn) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["banExpiresIn"],
            message: "Ban expires in is required",
        })
    }
})

export const UserForm = ({user}: { user: UserWithRole }) => {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const form = useForm<z.infer<typeof userSchema>>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            role: "user",
            banned: false,
            banReason: "",
            banExpiresIn: 0
        },
    })

    useEffect(() => {
        form.reset({
            role: user.role || "user",
            banned: user.banned || false,
            banReason: user.banReason || "",
            banExpiresIn: user.banExpires ? getUnixTime(user.banExpires) : 0
        })
    }, [])

    const onSubmit = async (data: z.infer<typeof userSchema>) => {
        setLoading(true)
        await authClient.admin.setRole({
            userId: user.id,
            role: data.role as "user" | "admin",
        })
        if (data.banned) {
            await authClient.admin.banUser({
                userId: user.id,
                banReason: data.banReason,
                banExpiresIn: data.banExpiresIn ? differenceInSeconds(fromUnixTime(data.banExpiresIn!), new Date()) : undefined
            })
        } else if (!data.banned && user.banned) {
            await authClient.admin.unbanUser({
                userId: user.id
            })
        }
        router.refresh()
        form.reset()
        setLoading(false)
    }

    return (
        <Card className="shadow-none">
            <CardHeader>
                <CardTitle>Edit User</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <FormField
                            control={form.control}
                            name="role"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="min-w-lg">
                                                <SelectValue placeholder="Select a role to assign"/>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="user">Regular User</SelectItem>
                                            <SelectItem value="admin">System Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        You can change user&apos;s role here
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <hr className="my-4"/>
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="banned"
                                render={({field}) => (
                                    <FormItem>
                                        <div className="flex flex-row items-center gap-2">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={(checked) => field.onChange(checked)}
                                                />
                                            </FormControl>
                                            <FormLabel>Ban User</FormLabel>
                                        </div>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="banReason"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-normal">Ban Reason</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Give a ban reason"
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Ban reason is required if ban user is checked
                                        </FormDescription>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="banExpiresIn"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-normal">Ban Expires In</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-[240px] pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(fromUnixTime(field.value), "PPP HH:mm")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <CalendarWithTime
                                                    disabled={[
                                                        {before: new Date()},
                                                    ]}
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    autoFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormDescription>
                                            Ban expire is required if ban user is checked
                                        </FormDescription>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <hr className="my-4"/>
                        <Button className="self-end" loading={loading}>Update User</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}