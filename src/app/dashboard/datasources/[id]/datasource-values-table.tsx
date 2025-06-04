"use client";

import { DataTable } from "@/components/datatable/data-table";
import { DataTableColumnHeader } from "@/components/datatable/data-table-column-header";
import { DataTableToolbar } from "@/components/datatable/data-table-toolbar";
import { Datasource, DatasourceValue } from "@/db/types";
import { useDataTable } from "@/hooks/use-data-table";
import { ColumnDef } from "@tanstack/react-table";
import { use } from "react";

interface DatasourceValuesTableProps {
    promise: Promise<DatasourceValue[]>;
    datasource: Datasource;
}

export function DatasourceValuesTable({ promise, datasource }: DatasourceValuesTableProps) {
    const values = use(promise);
    
    // Create columns dynamically based on the datasource columns
    const columns: ColumnDef<DatasourceValue>[] = [
        {
            id: "id",
            accessorKey: "id",
            header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
            cell: ({ row }) => <div className="min-w-20">{row.getValue("id")}</div>,
            enableSorting: true,
            enableHiding: false,
        },
        ...datasource.columns.map((column) => ({
            id: column,
            accessorFn: (row) => (row.data as Record<string, string>)[column],
            header: ({ column: tableColumn }) => (
                <DataTableColumnHeader 
                    column={tableColumn} 
                    title={column} 
                    className={
                        column === datasource.valueColumn || column === datasource.displayColumn 
                            ? "font-bold" 
                            : ""
                    }
                />
            ),
            cell: ({ row }) => (
                <div className={
                    column === datasource.valueColumn || column === datasource.displayColumn 
                        ? "font-medium" 
                        : ""
                }>
                    {(row.original.data as Record<string, string>)[column] || "-"}
                </div>
            ),
            enableSorting: true,
            enableHiding: true,
        })),
    ];
console.log(values);
    const { table } = useDataTable({
        data: values,
        columns,
        pageCount: 1,
        initialState: {
            sorting: [{ id: "id", desc: false }],
        },
    });

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Values ({values.length})</h2>
            <DataTable table={table}>
                <DataTableToolbar table={table} />
            </DataTable>
        </div>
    );
}