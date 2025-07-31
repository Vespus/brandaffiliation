'use client'

import { use } from 'react'

import { toast } from 'sonner'
import { DatasourceTableActionBar } from '@/app/dashboard/datasources/datasource-table-action-bar'
import { getDatasourceTableColumns } from '@/app/dashboard/datasources/datasource-table-columns'
import { DatasourceDatatable } from '@/app/dashboard/datasources/type'
import { useDatasourceParams } from '@/app/dashboard/datasources/use-datasource-params'
import { DataTable } from '@/components/datatable/data-table'
import { DataTableSortList } from '@/components/datatable/data-table-sort-list'
import { DataTableToolbar } from '@/components/datatable/data-table-toolbar'
import { Datasource } from '@/db/types'
import { useCustomAction } from '@/hooks/use-custom-action'
import { useDataTable } from '@/hooks/use-data-table'
import { deleteDatasource } from './actions'

interface DatasourceTableProps {
    promise: Promise<Awaited<DatasourceDatatable>>
}

export function DatasourceTable({ promise }: DatasourceTableProps) {
    const { data, pageCount } = use(promise)
    const { setParams } = useDatasourceParams()

    const deleteDatasourceAction = useCustomAction(deleteDatasource, {
        onSuccess: ({ data }) => {
            toast.success(data?.message)
        },
    })

    // Handle edit dialog open
    const handleEditClick = (datasource: Datasource) => {
        setParams({ editDatasource: datasource.id })
    }

    // Handle delete datasource
    const handleDeleteDatasource = async (id: number) => {
        deleteDatasourceAction.execute({ id })
    }

    const columns = getDatasourceTableColumns(handleEditClick, handleDeleteDatasource, deleteDatasourceAction.isPending)

    const { table } = useDataTable({
        data,
        columns,
        pageCount,
        initialState: {
            sorting: [{ id: 'name', desc: false }],
        },
        shallow: false,
        clearOnDefault: true,
    })

    return (
        <DataTable table={table} actionBar={<DatasourceTableActionBar table={table} />}>
            <DataTableToolbar table={table}>
                <DataTableSortList table={table} align="end" />
            </DataTableToolbar>
        </DataTable>
    )
}
