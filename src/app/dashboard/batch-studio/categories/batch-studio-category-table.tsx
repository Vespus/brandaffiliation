'use client'

import { use } from 'react'

import { useTranslations } from 'next-intl'

import { useGetBatchStudioCategoryTableColumns } from '@/app/dashboard/batch-studio/categories/batch-studio-category-table-columns'
import { BatchStudioCategoryType } from '@/app/dashboard/batch-studio/categories/batch-studio-category-type'
import { CommonToolbar } from '@/app/dashboard/batch-studio/common-toolbar'
import { DataTable } from '@/components/datatable/data-table'
import { DataTableSortList } from '@/components/datatable/data-table-sort-list'
import { DataTableToolbar } from '@/components/datatable/data-table-toolbar'
import { useDataTable } from '@/hooks/use-data-table'

interface CategoriesTableProps {
    promise: Promise<{ data: BatchStudioCategoryType[]; pageCount: number; total: number }>
}

export const BatchStudioCategoryTable = ({ promise }: CategoriesTableProps) => {
    const { data, pageCount, total } = use(promise)
    const columns = useGetBatchStudioCategoryTableColumns()
    const t = useTranslations()

    const { table } = useDataTable({
        data: data,
        meta: { t },
        columns,
        pageCount,
        rowCount: total,
        enableColumnPinning: true,
        initialState: {
            sorting: [{ id: 'description', desc: false }],
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
            <CommonToolbar table={table} type="category" />
        </DataTable>
    )
}
