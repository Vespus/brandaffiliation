"use client"

import { DataTable } from "@/components/datatable/data-table"
import { DataTableSortList } from "@/components/datatable/data-table-sort-list"
import {BrandTableActionBar} from "@/app/dashboard/brands/brand-table-action-bar";
import {getBrands} from "@/app/dashboard/brands/queries";
import { use } from "react";
import {useDataTable} from "@/hooks/use-data-table";
import {getBranchTableColumns} from "@/app/dashboard/brands/brand-table-columns";
import {DataTableToolbar} from "@/components/datatable/data-table-toolbar";
import {useTranslations} from "next-intl";

interface BrandsTableProps {
    promise: Promise<Awaited<ReturnType<typeof getBrands>>>
}

export const BrandTable = ({promise}: BrandsTableProps) => {
    const {data, pageCount} = use(promise)
    const t = useTranslations()

    const columns = getBranchTableColumns()

    const { table } = useDataTable({
        data: data.brands,
        meta: { t },
        columns,
        pageCount,
        initialState: {
            sorting: [{ id: "name", desc: false }],
        },
        shallow: false,
        clearOnDefault: true,
    })

    return (
        <>
            <DataTable
                table={table}
                actionBar={<BrandTableActionBar table={table} />}
            >
                <DataTableToolbar table={table}>
                    <DataTableSortList table={table} align="end" />
                </DataTableToolbar>
            </DataTable>
        </>
    )
}