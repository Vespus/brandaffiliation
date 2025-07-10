"use client"

import {DataTable} from "@/components/datatable/data-table"
import {DataTableSortList} from "@/components/datatable/data-table-sort-list"
import {use, useEffect} from "react";
import {useDataTable} from "@/hooks/use-data-table";
import {DataTableToolbar} from "@/components/datatable/data-table-toolbar";
import {useTranslations} from "next-intl";
import {getBatchStudioBrandTableColumns} from "@/app/dashboard/batch-studio/brands/batch-studio-brand-table-columns";
import {BatchStudioBrandType} from "@/app/dashboard/batch-studio/brands/batch-studio-brand-type";
import {Scroller} from "@/components/ui/scroller";
import {Button} from "@/components/ui/button";
import {api} from "@/lib/trpc/react";

interface BrandsTableProps {
    promise: Promise<{ data: BatchStudioBrandType[], pageCount: number }>
}

export const BatchStudioBrandTable = ({promise}: BrandsTableProps) => {
    const {data, pageCount} = use(promise)
    const t = useTranslations()
    const columns = getBatchStudioBrandTableColumns()
    const utils = api.useUtils()

    const {table} = useDataTable({
        data: data,
        meta: {t},
        columns,
        pageCount,
        enableColumnPinning: true,
        initialState: {
            sorting: [{id: "name", desc: false}],
        },
        getRowId: r => r.integrationId,
        shallow: false,
        clearOnDefault: true,
    })

    useEffect(() => {
        console.log(table.getSelectedRowModel())
    }, [table.getState()])

    const selectAllHandler = async () => {
        const allBrands = await utils.client.batchStudioRoute.getAllBrands.query()
        table.setRowSelection(() => allBrands.filter(x => x.integrationId).reduce((acc,b) => (acc[b.integrationId!] = true, acc), {} as Record<string, boolean>))
    }

    return (
        <div className="flex-1 p-4 flex flex-col min-h-0 ">
            <div className="flex gap-2">
                <Button>Select All Brands Without Content</Button>
                <Button onClick={selectAllHandler}>Select All</Button>
            </div>
            <DataTable table={table}>
                <DataTableToolbar table={table}>
                    <DataTableSortList table={table} align="end"/>
                </DataTableToolbar>
            </DataTable>
        </div>
    )
}