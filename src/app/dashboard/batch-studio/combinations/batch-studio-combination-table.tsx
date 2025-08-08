'use client'

import { use, useEffect } from 'react'

import { useTranslations } from 'next-intl'

import { SquareDashedMousePointerIcon, SquareMousePointerIcon } from 'lucide-react'
import { useGetBatchStudioCombinationTableColumns } from '@/app/dashboard/batch-studio/combinations/batch-studio-combination-table-columns'
import { BatchStudioCombinationType } from '@/app/dashboard/batch-studio/combinations/batch-studio-combination-type'
import { useDataTableSelectionStore } from '@/app/dashboard/batch-studio/store'
import { DataTable } from '@/components/datatable/data-table'
import { DataTableSortList } from '@/components/datatable/data-table-sort-list'
import { DataTableToolbar } from '@/components/datatable/data-table-toolbar'
import { Button } from '@/components/ui/button'
import { useDataTable } from '@/hooks/use-data-table'
import { api } from '@/lib/trpc/react'

interface BrandsTableProps {
    promise: Promise<{ data: BatchStudioCombinationType[]; pageCount: number; total: number }>
}

export const BatchStudioCombinationTable = ({ promise }: BrandsTableProps) => {
    const { data, pageCount, total } = use(promise)
    const columns = useGetBatchStudioCombinationTableColumns()
    const utils = api.useUtils()
    const t = useTranslations()
    const { setSelected } = useDataTableSelectionStore()

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

    const state = table.getState()

    useEffect(() => {
        setSelected(state.rowSelection)
    }, [state.rowSelection])

    const selectAllHandler = async () => {
        const allBrands = await utils.client.batchStudioRoute.getAllCombinations.query()
        const allRows = allBrands
            .filter((x) => x.integrationId)
            .reduce((acc, b) => ((acc[b.integrationId!] = true), acc), {} as Record<string, boolean>)
        table.setRowSelection(allRows)
    }

    const selectAllWithoutContentHandler = async () => {
        const allBrands = await utils.client.batchStudioRoute.getAllCombinationsWithNoContent.query()
        const allRows = allBrands
            .filter((x) => x.integrationId)
            .reduce((acc, b) => ((acc[b.integrationId!] = true), acc), {} as Record<string, boolean>)
        table.setRowSelection(allRows)
    }

    const selectAllWithoutTextContentsHandler = async () => {
        const allCatalogs = await utils.client.batchStudioRoute.getAllCombinationsWithNoTextContent.query()
        const allRows = allCatalogs
            .filter((x) => x.integrationId)
            .reduce((acc, b) => ((acc[b.integrationId!] = true), acc), {} as Record<string, boolean>)
        table.setRowSelection(allRows)
    }

    const clearSelectionHandler = async () => {
        table.resetRowSelection(true)
    }

    return (
        <DataTable table={table}>
            <DataTableToolbar table={table}>
                <DataTableSortList table={table} align="end" />
            </DataTableToolbar>
            <div className="flex h-9 items-center gap-4">
                <span className="text-sm">
                    You&apos;ve selected {Object.keys(table.getState().rowSelection).length} records
                </span>
                <Button size="sm" variant="outline" onClick={selectAllHandler}>
                    <SquareMousePointerIcon />
                    Select All Records
                </Button>
                <Button size="sm" variant="outline" onClick={selectAllWithoutContentHandler}>
                    <SquareDashedMousePointerIcon />
                    Select w/o Contents
                </Button>
                <Button size="sm" variant="outline" onClick={selectAllWithoutTextContentsHandler}>
                    <SquareDashedMousePointerIcon />
                    Select w/o SEO Texts
                </Button>
            </div>
            {Object.keys(table.getState().rowSelection).length > 0 && (
                <div>
                    <span className="text-xs font-bold underline" role="button" onClick={clearSelectionHandler}>
                        Unselect All
                    </span>
                </div>
            )}
        </DataTable>
    )
}
