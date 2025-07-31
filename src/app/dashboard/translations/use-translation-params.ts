'use client'

import { parseAsBoolean, useQueryStates } from 'nuqs'
import { parseAsInteger } from 'nuqs/server'

export const useTranslationParams = (options?: { shallow: boolean }) => {
    const [params, setParams] = useQueryStates(
        {
            createTranslation: parseAsBoolean,
            editTranslation: parseAsInteger,
        },
        { ...options, throttleMs: 50 }
    )

    return {
        ...params,
        setParams,
    }
}
