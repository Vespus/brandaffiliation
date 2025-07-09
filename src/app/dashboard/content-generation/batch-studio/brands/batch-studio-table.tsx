"use client"

import { DataTable } from "@/components/datatable/data-table"
import { DataTableSortList } from "@/components/datatable/data-table-sort-list"
import { BrandTableActionBar } from "@/app/dashboard/brands/brand-table-action-bar";
import { getBrands } from "@/app/dashboard/brands/queries";
import { use } from "react";
import { useDataTable } from "@/hooks/use-data-table";
import { getBranchTableColumns } from "@/app/dashboard/brands/brand-table-columns";
import { DataTableToolbar } from "@/components/datatable/data-table-toolbar";
import { useTranslations } from "next-intl";
import {QSPayCombin} from "@/qspay-types";

interface BrandsTableProps {
    promise: Promise<Awaited<QSPayCombin[]>>
}

export const BatchStudioTable = ({promise}: BrandsTableProps) => {
    const data = use(promise)
    const t = useTranslations()
    const columns = getBranchTableColumns()
console.log(data)
    const {table} = useDataTable({
        data: data,
        meta: {t},
        columns,
        pageCount: 0,
        enableColumnPinning: true,
        initialState: {
            sorting: [{id: "name", desc: false}],
            columnPinning: {left: ["link", "name"]},
        },
        shallow: false,
        clearOnDefault: true,
    })

    return (
        <>
            <DataTable table={table}>
                <DataTableToolbar table={table}>
                    <DataTableSortList table={table} align="end"/>
                </DataTableToolbar>
            </DataTable>
        </>
    )
}