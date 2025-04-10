import { DataTable } from "@/components/datatable/data-table"
import { DataTableSortList } from "@/components/datatable/data-table-sort-list"
import { DataTableToolbar } from "@/components/datatable/data-table-toolbar"

export const BrandTable = () => {
    return (
        <>
            <DataTable
                table={table}
                actionBar={<TasksTableActionBar table={table} />}
            >
                <DataTableToolbar table={table}>
                    <DataTableSortList table={table} align="end" />
                </DataTableToolbar>
            </DataTable>
        </>
    )
}