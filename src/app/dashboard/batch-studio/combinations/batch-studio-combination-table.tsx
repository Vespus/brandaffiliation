'use client'

import { use } from 'react'

import { useTranslations } from 'next-intl'

import { useGetBatchStudioCombinationTableColumns } from '@/app/dashboard/batch-studio/combinations/batch-studio-combination-table-columns'
import { BatchStudioCombinationType } from '@/app/dashboard/batch-studio/combinations/batch-studio-combination-type'
import { CommonToolbar } from '@/app/dashboard/batch-studio/common-toolbar'
import { DataTable } from '@/components/datatable/data-table'
import { DataTableSortList } from '@/components/datatable/data-table-sort-list'
import { DataTableToolbar } from '@/components/datatable/data-table-toolbar'
import { useDataTable } from '@/hooks/use-data-table'

interface BrandsTableProps {
    promise: Promise<{ data: BatchStudioCombinationType[]; pageCount: number; total: number }>
}

export const BatchStudioCombinationTable = ({ promise }: BrandsTableProps) => {
    const { data, pageCount, total } = use(promise)
    const columns = useGetBatchStudioCombinationTableColumns()
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
            <CommonToolbar table={table} type="combination" />
        </DataTable>
    )
}
