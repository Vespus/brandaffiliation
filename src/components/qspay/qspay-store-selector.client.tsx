"use client"

import { changeStore } from "@/components/qspay/qspay-store-selector-action";
import { ComboboxBase } from "@/components/ui/combobox-base";
import { useCustomAction } from "@/hooks/use-custom-action";
import { QSPayStore } from "@/qspay-types";
import { parseAsString, useQueryState } from "nuqs";
import { useState } from "react";

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
    const [error] = useQueryState("error", parseAsString)

    return (
        <ComboboxBase
            labelKey="name"
            valueKey="storeId"
            value={value}
            onValueChange={(val) => {
                setValue(val)
                changeStoreAction.execute({storeId: val})
            }}
            placeholder="Select a store"
            emptyPlaceholder="No store selected"
            searchPlaceholder="Search..."
            data={storeList}
            className={error ? "border-red-500 dark:border-red-700" : ""}
        />
    )
}