'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { User } from 'better-auth'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { updateProfileAction } from '@/app/dashboard/profile/actions'
import AvatarField from '@/app/dashboard/profile/form-elements/avatar-field'
import { ThemeSelector } from '@/app/dashboard/profile/form-elements/theme-selector'
import { ProfileFormValues, ProfileUpdateSchema } from '@/app/dashboard/profile/schema'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useCustomAction } from '@/hooks/use-custom-action'

interface ProfileFormProps {
    user: User
}

export const ProfileForm = ({ user }: ProfileFormProps) => {
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(ProfileUpdateSchema),
        defaultValues: {
            name: user.name || '',
            image: user.image || '',
        },
    })

    const updateProfileActionCall = useCustomAction(updateProfileAction, {
        onSuccess: () => {
            toast.success('Profile updated successfully')
        },
    })

    const onSubmit = (values: ProfileFormValues) => {
        updateProfileActionCall.execute(values)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Settings</CardTitle>
                        <CardDescription>Update your profile information and preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-center p-8">
                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <AvatarField {...field} onChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <hr />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <ThemeSelector />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" loading={updateProfileActionCall.isPending}>
                        Save Changes
                    </Button>
                </div>
            </form>
        </Form>
    )
}
