import { cookies } from 'next/headers'

import { QSPayClient } from '@/lib/qs-pay-client'
import { QSPayUser } from '@/qspay-types'

export const getQspayUser = async () => {
    const cookie = await cookies()
    if (!cookie.get('qs-pay-integration-key')) {
        return null
    }

    try {
        const { result } = await QSPayClient<QSPayUser>('User/Get')
        return result
    } catch (e) {
        void e
        return null
    }
}
