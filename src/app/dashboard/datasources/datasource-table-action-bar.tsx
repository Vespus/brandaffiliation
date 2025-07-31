'use client'

import * as React from 'react'

import type { Table } from '@tanstack/react-table'

import { Download } from 'lucide-react'
import {
    DataTableActionBar,
    DataTableActionBarAction,
    DataTableActionBarSelection,
} from '@/components/datatable/data-table-action-bar'
import { Separator } from '@/components/ui/separator'
import { Datasource } from '@/db/types'
import { exportTableToCSV } from '@/lib/datatable/export'

interface DatasourceTableActionBarProps {
    table: Table<Datasource>
}

export function DatasourceTableActionBar({ table }: DatasourceTableActionBarProps) {
    const rows = table.getFilteredSelectedRowModel().rows
    const [isPending, startTransition] = React.useTransition()
    const [currentAction, setCurrentAction] = React.useState<string | null>(null)

    const getIsActionPending = React.useCallback(
        (action: string) => isPending && currentAction === action,
        [isPending, currentAction]
    )

    const onDatasourceExport = React.useCallback(() => {
        setCurrentAction('export')
        startTransition(() => {
            exportTableToCSV(table, {
                excludeColumns: ['select', 'actions'],
                onlySelected: true,
            })
        })
    }, [table])

    return (
        <DataTableActionBar table={table} visible={rows.length > 0}>
            <DataTableActionBarSelection table={table} />
            <Separator orientation="vertical" className="hidden data-[orientation=vertical]:h-5 sm:block" />
            <div className="flex items-center gap-1.5">
                <DataTableActionBarAction
                    size="icon"
                    tooltip="Export datasources"
                    isPending={getIsActionPending('export')}
                    onClick={onDatasourceExport}
                >
                    <Download />
                </DataTableActionBarAction>
            </div>
        </DataTableActionBar>
    )
}
