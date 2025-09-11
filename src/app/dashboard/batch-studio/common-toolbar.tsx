import * as React from 'react';
import { useEffect } from 'react';



import type { Table } from '@tanstack/react-table';



import { SquareDashedMousePointerIcon, XIcon } from 'lucide-react';
import { useDataTableSelectionStore } from '@/app/dashboard/batch-studio/store';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { api } from '@/lib/trpc/react'
import { SelectionQuery, SelectionSubQuery } from '@/lib/trpc/routes/batch-studio.route'


type BatchStudioCommonDataTableToolbarProps<TData> = {
    table: Table<TData>
    type: string
}

export const CommonToolbar = <TData,>({ table, ...props }: BatchStudioCommonDataTableToolbarProps<TData>) => {
    const { selected, setSelected } = useDataTableSelectionStore()
    const utils = api.useUtils()

    const selectionHandler = async (subType: string) => {
        const selectionIds = await utils.client.batchStudioRoute.selection.query({
            type: props.type as SelectionQuery,
            subType: subType as SelectionSubQuery,
        })
        table.setRowSelection(Object.fromEntries(selectionIds.filter(Boolean).map((id) => [id, true])))
    }

    const clearSelectionHandler = async () => {
        table.resetRowSelection(true)
    }

    const state = table.getState()

    useEffect(() => {
        setSelected(state.rowSelection)
    }, [state.rowSelection])

    return (
        <div className="flex h-9 items-center gap-2">
            <span className="text-sm">You&apos;ve selected {Object.keys(selected).length} records</span>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="border-dashed">
                        <SquareDashedMousePointerIcon />
                        Selection Menu
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => selectionHandler('all')}>All Records</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => selectionHandler('no-content')}>Empty Contents</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => selectionHandler('no-text-content')}>
                        Missing SEO Texts
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => selectionHandler('no-processed')}>
                        Not Processed with AI
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            {Object.keys(table.getState().rowSelection).length > 0 && (
                <Button variant="outline" onClick={clearSelectionHandler} size="sm" className="border-dashed">
                    <XIcon /> Reset Selections
                </Button>
            )}
        </div>
    )
}
