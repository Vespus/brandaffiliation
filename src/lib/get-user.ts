import { cache } from 'react'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'

type Session = typeof auth.$Infer.Session

export const getUser = cache(async (): Promise<Session> => {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        redirect('/auth/sign-in')
    }

    return session
})
