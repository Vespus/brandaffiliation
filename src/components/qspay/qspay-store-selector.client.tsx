'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { parseAsString, useQueryState } from 'nuqs'
import { changeStore } from '@/components/qspay/qspay-store-selector-action'
import { ComboboxBase } from '@/components/ui/combobox-base'
import { useCustomAction } from '@/hooks/use-custom-action'
import { cn } from '@/lib/utils'
import { QSPayStore } from '@/qspay-types'

export function QspayStoreSelectorClient({
    storeList,
    currentValue,
}: {
    storeList: QSPayStore[]
    currentValue?: string
}) {
    const router = useRouter()
    const [error] = useQueryState('error', parseAsString)
    const [optimisticValue, setOptimisticValue] = useState<string | undefined>(currentValue ?? undefined)

    const changeStoreAction = useCustomAction(changeStore, {
        onSuccess: () => {
            router.refresh()
        },
    })

    return (
        <ComboboxBase
            labelKey="name"
            valueKey="storeId"
            value={optimisticValue}
            onValueChange={(val) => {
                changeStoreAction.execute({ storeId: val as string })
                setOptimisticValue(val as string)
            }}
            placeholder="Select a store"
            emptyPlaceholder="No store selected"
            searchPlaceholder="Search..."
            data={storeList || []}
            className={cn(error && 'border-red-500 dark:border-red-700', 'w-sm')}
        />
    )
}
