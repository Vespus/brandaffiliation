import * as React from 'react'

import Link from 'next/link'
import { unauthorized } from 'next/navigation'

import { format } from 'date-fns'
import { eq } from 'drizzle-orm'
import { ArrowLeft, CircleAlertIcon } from 'lucide-react'
import { SearchParams } from 'nuqs/server'
import { UserForm } from '@/app/dashboard/users/[id]/user-form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { db } from '@/db'
import { users } from '@/db/schema'
import { auth } from '@/lib/auth'
import { getUser } from '@/lib/get-user'

type UserDetailPage = {
    searchParams: Promise<SearchParams>
    params: Promise<{ id: string }>
}

export default async function UserDetailPage(props: UserDetailPage) {
    const { id } = await props.params

    const { user: currentUser } = await getUser()
    const { success } = await auth.api.userHasPermission({
        body: {
            userId: currentUser.id,
            role: 'admin',
            permission: {
                users: ['list'],
            },
        },
    })

    if (!success) {
        unauthorized()
    }

    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
    const userInitials = user.name
        .split(' ')
        .map((name) => name.charAt(0).toUpperCase())
        .join('')

    return (
        <div className="flex w-full max-w-3xl flex-col gap-4">
            <div className="mb-4 flex items-center space-x-2">
                <Link href="/dashboard/users">
                    <ArrowLeft />
                </Link>
                <h1 className="text-2xl font-semibold">User Detail</h1>
            </div>
            <Card className="rounded-md shadow-none">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Details of {user.name}</CardTitle>
                        <Badge variant={user.role === 'admin' ? 'important' : 'default'} className="capitalize">
                            {user.role}
                        </Badge>
                    </div>
                    <CardDescription>You can see the details of {user.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Avatar className="size-24 rounded-lg">
                        {user.image && (
                            <AvatarImage src={user.image} alt={user.name} className="aspect-auto object-cover" />
                        )}
                        <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1.5">
                            <Label className="text-muted-foreground">Name</Label>
                            <p className="font-medium">{user.name}</p>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-muted-foreground">Email</Label>
                            <p className="font-medium">{user.email}</p>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-muted-foreground">Role</Label>
                            <p className="font-medium capitalize">{user.role}</p>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-muted-foreground">Created At</Label>
                            <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            {user.banned && (
                <div className="rounded-md border px-4 py-3">
                    <p className="mb-2 text-sm">
                        <CircleAlertIcon
                            className="text-destructive me-3 -mt-0.5 inline-flex"
                            size={16}
                            aria-hidden="true"
                        />
                        This user is <strong>banned</strong> until {format(user.banExpires!, 'dd-MM-yyyy HH:mm')}
                    </p>
                    <p className="pl-7 text-xs">Ban reason: {user.banReason}</p>
                </div>
            )}
            {user.id !== currentUser.id && <UserForm user={user} />}
        </div>
    )
}
