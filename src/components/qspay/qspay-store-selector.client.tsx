"use client"

import { changeStore } from "@/components/qspay/qspay-store-selector-action";
import { ComboboxBase } from "@/components/ui/combobox-base";
import { useCustomAction } from "@/hooks/use-custom-action";
import { QSPayStore } from "@/qspay-types";
import { useEffect, useState } from "react";

export const QspayStoreSelectorClient = ({
                                             storeList,
                                             selectedStore
                                         }:
                                         {
                                             storeList: QSPayStore[],
                                             selectedStore?: string;
                                         }) => {
    const [value, setValue] = useState(selectedStore);
    const changeStoreAction = useCustomAction(changeStore)

    useEffect(() => {
        if(value !== selectedStore) {
            changeStoreAction.execute({storeId: value})
        }
    }, [value])

    return (
        <ComboboxBase
            valueDisplayKey="storeUrl"
            valueKey="storeId"
            value={value}
            onValueChange={setValue}
            placeholder="Select a store"
            emptyPlaceholder="No store selected"
            searchPlaceholder="Search..."
            data={storeList}

        />
    )
}