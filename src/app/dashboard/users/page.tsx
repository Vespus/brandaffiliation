import { Suspense } from 'react'

import { unauthorized } from 'next/navigation'

import { SearchParams } from 'nuqs/server'
import { getUsers, searchParamsCache } from '@/app/dashboard/users/queries'
import { UsersTable } from '@/app/dashboard/users/users-table'
import { auth } from '@/lib/auth'
import { getUser } from '@/lib/get-user'

type UsersPageProps = {
    searchParams: Promise<SearchParams>
}

export default async function UsersPage(props: UsersPageProps) {
    const searchParams = await props.searchParams
    const search = searchParamsCache.parse(searchParams)

    const { user } = await getUser()
    const { success } = await auth.api.userHasPermission({
        body: {
            userId: user.id,
            role: 'admin',
            permission: {
                users: ['list'],
            },
        },
    })

    if (!success) {
        unauthorized()
    }

    const users = getUsers(search)

    return (
        <Suspense>
            <UsersTable promise={users} />
        </Suspense>
    )
}
