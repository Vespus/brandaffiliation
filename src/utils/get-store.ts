import { cookies } from 'next/headers'

import { QSPayClient } from '@/lib/qs-pay-client'
import { QSPayStore } from '@/qspay-types'

export const getStore = async () => {
    const cookieList = await cookies()

    if (cookieList.has('qs-pay-integration-key')) {
        try {
            if (cookieList.has('qs-pay-store-id')) {
                const { result: store } = await QSPayClient<QSPayStore>('Store/Get', {
                    query: {
                        storeId: cookieList.get('qs-pay-store-id')?.value,
                    },
                })

                return store
            }
        } catch (error) {
            throw error
        }
    }

    return null
}
