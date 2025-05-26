"use client";

import {
    DataTableActionBar,
    DataTableActionBarAction,
    DataTableActionBarSelection,
} from "@/components/datatable/data-table-action-bar";

import { Separator } from "@/components/ui/separator";
import { exportTableToCSV } from "@/lib/datatable/export";
import type { Table } from "@tanstack/react-table";
import { User } from "better-auth";
import { Download } from "lucide-react";
import * as React from "react";

interface UsersTableActionBar {
    table: Table<User>;
}

export function UsersTableActionBar({table}: UsersTableActionBar) {
    const rows = table.getFilteredSelectedRowModel().rows;
    const [isPending, startTransition] = React.useTransition();
    const [currentAction, setCurrentAction] = React.useState<string | null>(null);

    const getIsActionPending = React.useCallback(
        (action: string) => isPending && currentAction === action,
        [isPending, currentAction],
    );

    const onTaskExport = React.useCallback(() => {
        setCurrentAction("export");
        startTransition(() => {
            exportTableToCSV(table, {
                excludeColumns: ["select", "actions"],
                onlySelected: true,
            });
        });
    }, [table]);


    return (
        <DataTableActionBar table={table} visible={rows.length > 0}>
            <DataTableActionBarSelection table={table}/>
            <Separator
                orientation="vertical"
                className="hidden data-[orientation=vertical]:h-5 sm:block"
            />
            <div className="flex items-center gap-1.5">
                <DataTableActionBarAction
                    size="icon"
                    tooltip="Export tasks"
                    isPending={getIsActionPending("export")}
                    onClick={onTaskExport}
                >
                    <Download/>
                </DataTableActionBarAction>
            </div>
        </DataTableActionBar>
    );
}