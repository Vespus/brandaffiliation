'use client'

import { use, useEffect } from 'react'

import { useTranslations } from 'next-intl'

import { SquareDashedMousePointerIcon, SquareMousePointerIcon, XIcon } from 'lucide-react'
import { useGetBatchStudioCategoryTableColumns } from '@/app/dashboard/batch-studio/categories/batch-studio-category-table-columns'
import { BatchStudioCategoryType } from '@/app/dashboard/batch-studio/categories/batch-studio-category-type'
import { useDataTableSelectionStore } from '@/app/dashboard/batch-studio/store'
import { DataTable } from '@/components/datatable/data-table'
import { DataTableSortList } from '@/components/datatable/data-table-sort-list'
import { DataTableToolbar } from '@/components/datatable/data-table-toolbar'
import { Button } from '@/components/ui/button'
import { useDataTable } from '@/hooks/use-data-table'
import { api } from '@/lib/trpc/react'

interface CategoriesTableProps {
    promise: Promise<{ data: BatchStudioCategoryType[]; pageCount: number; total: number }>
}

export const BatchStudioCategoryTable = ({ promise }: CategoriesTableProps) => {
    const { data, pageCount, total } = use(promise)
    const columns = useGetBatchStudioCategoryTableColumns()
    const utils = api.useUtils()
    const t = useTranslations()
    const { selected, setSelected } = useDataTableSelectionStore()

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

    const state = table.getState()

    useEffect(() => {
        setSelected(state.rowSelection)
    }, [state.rowSelection])

    const selectAllHandler = async () => {
        const allCategories = await utils.client.batchStudioRoute.getAllCategories.query()
        const allRows = allCategories
            .filter((x) => x.integrationId)
            .reduce((acc, b) => ((acc[b.integrationId!] = true), acc), {} as Record<string, boolean>)
        table.setRowSelection(allRows)
        setSelected(allRows)
    }

    const selectAllWithoutContentHandler = async () => {
        const allCategories = await utils.client.batchStudioRoute.getAllCategoriesWithNoContent.query()
        const allRows = allCategories
            .filter((x) => x.integrationId)
            .reduce((acc, b) => ((acc[b.integrationId!] = true), acc), {} as Record<string, boolean>)
        table.setRowSelection(allRows)
        setSelected(allRows)
    }

    const selectAllWithoutTextContentHandler = async () => {
        const allCategories = await utils.client.batchStudioRoute.getAllCategoriesWithNoTextContent.query()
        const allRows = allCategories
            .filter((x) => x.integrationId)
            .reduce((acc, b) => ((acc[b.integrationId!] = true), acc), {} as Record<string, boolean>)
        table.setRowSelection(allRows)
        setSelected(allRows)
    }

    const clearSelectionHandler = async () => {
        setSelected({})
        table.resetRowSelection()
    }

    return (
        <DataTable table={table}>
            <DataTableToolbar table={table}>
                <DataTableSortList table={table} align="end" />
            </DataTableToolbar>
            <div className="flex h-9 items-center gap-4">
                <span className="text-sm">You&apos;ve selected {Object.keys(selected).length} records</span>
                <Button size="sm" variant="link" onClick={selectAllHandler}>
                    <SquareMousePointerIcon />
                    Select All Records
                </Button>
                <Button size="sm" variant="link" onClick={selectAllWithoutContentHandler}>
                    <SquareDashedMousePointerIcon />
                    Select w/o Contents
                </Button>
                <Button size="sm" variant="link" onClick={selectAllWithoutTextContentHandler}>
                    <SquareDashedMousePointerIcon />
                    Select w/o Texts
                </Button>
                {Object.keys(selected).length > 0 && (
                    <>
                        <Button size="sm" variant="link" onClick={clearSelectionHandler}>
                            <XIcon />
                            Clear Selected
                        </Button>
                    </>
                )}
            </div>
        </DataTable>
    )
}
