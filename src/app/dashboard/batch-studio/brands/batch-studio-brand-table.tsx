'use client'

import { use } from 'react'

import { useTranslations } from 'next-intl'

import { useGetBatchStudioBrandTableColumns } from '@/app/dashboard/batch-studio/brands/batch-studio-brand-table-columns'
import { BatchStudioBrandType } from '@/app/dashboard/batch-studio/brands/batch-studio-brand-type'
import { CommonToolbar } from '@/app/dashboard/batch-studio/common-toolbar'
import { DataTable } from '@/components/datatable/data-table'
import { DataTableSortList } from '@/components/datatable/data-table-sort-list'
import { DataTableToolbar } from '@/components/datatable/data-table-toolbar'
import { useDataTable } from '@/hooks/use-data-table'

interface BrandsTableProps {
    promise: Promise<{ data: BatchStudioBrandType[]; pageCount: number; total: number }>
}

export const BatchStudioBrandTable = ({ promise }: BrandsTableProps) => {
    const { data, pageCount, total } = use(promise)
    const columns = useGetBatchStudioBrandTableColumns()
    const t = useTranslations()

    const { table } = useDataTable({
        data: data,
        meta: { t },
        columns,
        pageCount,
        rowCount: total,
        enableColumnPinning: true,
        initialState: {
            sorting: [{ id: 'name', desc: false }],
        },
        getRowId: (r) => r.integrationId,
        shallow: false,
        clearOnDefault: true,
    })

    return (
        <DataTable table={table}>
            <DataTableToolbar table={table}>
                <DataTableSortList table={table} align="end" />
            </DataTableToolbar>
            <CommonToolbar table={table} type="brand" />
        </DataTable>
    )
}
