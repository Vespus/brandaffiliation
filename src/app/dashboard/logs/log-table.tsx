'use client';

import { use } from 'react';



import { SquareDashedMousePointerIcon, SquareMousePointerIcon } from 'lucide-react';
import { getLogTableColumns } from '@/app/dashboard/logs/log-table-columns';
import { LogTableType } from '@/app/dashboard/logs/log-table-type';
import { DataTable } from '@/components/datatable/data-table';
import { DataTableSortList } from '@/components/datatable/data-table-sort-list';
import { DataTableToolbar } from '@/components/datatable/data-table-toolbar';
import { Button } from '@/components/ui/button'
import { useDataTable } from '@/hooks/use-data-table'


interface BrandsTableProps {
    promise: Promise<{ data: LogTableType[]; pageCount: number; total: number }>
}

export const LogTable = ({ promise }: BrandsTableProps) => {
    const { data, pageCount, total } = use(promise)
    const columns = getLogTableColumns()

    const { table } = useDataTable({
        data: data,
        columns,
        pageCount,
        rowCount: total,
        enableColumnPinning: true,
        initialState: {
            sorting: [{ id: 'createdAt', desc: true }],
        },
        getRowId: (r) => r.id,
        shallow: false,
        clearOnDefault: true,
    })

    return (
        <DataTable table={table}>
            <DataTableToolbar table={table}>
                <DataTableSortList table={table} align="end" />
            </DataTableToolbar>
        </DataTable>
    )
}
