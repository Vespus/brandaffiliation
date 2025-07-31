'use client'

import { use } from 'react'

import { useFormatter, useTranslations } from 'next-intl'

import { getUsers } from '@/app/dashboard/users/queries'
import { UsersTableActionBar } from '@/app/dashboard/users/users-table-action-bar'
import { getUsersTableColumns } from '@/app/dashboard/users/users-table-columns'
import { DataTable } from '@/components/datatable/data-table'
import { DataTableSortList } from '@/components/datatable/data-table-sort-list'
import { DataTableToolbar } from '@/components/datatable/data-table-toolbar'
import { useDataTable } from '@/hooks/use-data-table'

interface BrandsTableProps {
    promise: Promise<Awaited<ReturnType<typeof getUsers>>>
}

export const UsersTable = ({ promise }: BrandsTableProps) => {
    const { data, pageCount } = use(promise)
    const t = useTranslations()
    const formatter = useFormatter()

    const columns = getUsersTableColumns()

    const { table } = useDataTable({
        data: data.users,
        meta: { t, formatter },
        columns,
        pageCount,
        enableColumnPinning: true,
        initialState: {
            sorting: [{ id: 'name', desc: false }],
            columnPinning: { left: ['link', 'name'] },
        },
        shallow: false,
        clearOnDefault: true,
    })

    return (
        <>
            <DataTable table={table} actionBar={<UsersTableActionBar table={table} />}>
                <DataTableToolbar table={table}>
                    <DataTableSortList table={table} align="end" />
                </DataTableToolbar>
            </DataTable>
        </>
    )
}
