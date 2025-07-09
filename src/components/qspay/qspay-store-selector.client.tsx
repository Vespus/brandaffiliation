"use client"

import { changeStore } from "@/components/qspay/qspay-store-selector-action";
import { ComboboxBase } from "@/components/ui/combobox-base";
import { useCustomAction } from "@/hooks/use-custom-action";
import { parseAsString, useQueryState } from "nuqs";
import {api} from "@/lib/trpc/react";
import {useCookie} from "@/hooks/use-cookie";
import {useState} from "react";
import {cn} from "@/lib/utils";

export function QspayStoreSelectorClient() {
    const {data} = api.qspayRoute.getUserStores.useQuery()
    const [value] = useCookie("qs-pay-store-id")
    const [error] = useQueryState("error", parseAsString)
    const [optimisticValue, setOptimisticValue] = useState<string | undefined>(value ?? undefined)

    const changeStoreAction = useCustomAction(changeStore)

    return (
        <ComboboxBase
            labelKey="name"
            valueKey="storeId"
            value={optimisticValue}
            onValueChange={(val) => {
                changeStoreAction.execute({storeId: val as string})
                setOptimisticValue(val as string)
            }}
            placeholder="Select a store"
            emptyPlaceholder="No store selected"
            searchPlaceholder="Search..."
            data={data || []}
            className={cn(error && "border-red-500 dark:border-red-700", "w-sm")}
        />
    )
}