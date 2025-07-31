'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

import { z } from 'zod'
import { actionClient } from '@/lib/action-client'
import { QSPayClient } from '@/lib/qs-pay-client'
import { QSPayAuthResponse } from '@/qspay-types'

export const connect = actionClient
    .inputSchema(
        z.object({
            email: z.string().email().min(1, 'Email is required'),
            password: z.string().min(1, 'Password is required'),
        })
    )
    .action(async ({ parsedInput: { email, password } }) => {
        const cookieList = await cookies()
        const { result } = await QSPayClient<QSPayAuthResponse>('User/Authenticate', {
            method: 'POST',
            body: JSON.stringify({
                userName: email,
                password,
            }),
        })

        if (!result) {
            throw new Error('Wrong credentials!')
        }

        cookieList.set('qs-pay-integration-key', result.accessToken, {
            expires: new Date(result.expires),
        })

        revalidatePath('/', 'layout')
    })
