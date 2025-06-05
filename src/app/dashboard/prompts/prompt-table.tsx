"use client";

import { getPrompts } from "@/app/dashboard/prompts/queries";
import { getPromptsTableColumns } from "@/app/dashboard/prompts/prompt-table-columns";
import { DataTable } from "@/components/datatable/data-table"
import { DataTableSortList } from "@/components/datatable/data-table-sort-list"
import { DataTableToolbar } from "@/components/datatable/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { useDataTable } from "@/hooks/use-data-table";
import { Plus } from "lucide-react";
import Link from "next/link";
import { use } from "react";

interface PromptsTableProps {
    promise: Promise<Awaited<ReturnType<typeof getPrompts>>>
}

export const PromptsTable = ({promise}: PromptsTableProps) => {
    const {data, pageCount} = use(promise)

    const columns = getPromptsTableColumns()

    const {table} = useDataTable({
        data: data.prompts,
        columns,
        pageCount,
        enableColumnPinning: false,
        initialState: {
            sorting: [{id: "name", desc: false}],
        },
        shallow: false,
        clearOnDefault: true,
    })

    return (
        <>
            <DataTable
                table={table}
                actionBar={
                    <div className="flex items-center gap-2">
                        <Link href="/dashboard/prompts/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Prompt
                        </Link>
                    </div>
                }
            >
                <DataTableToolbar table={table}>
                    <DataTableSortList table={table} align="end"/>
                </DataTableToolbar>
            </DataTable>
        </>
    )
}