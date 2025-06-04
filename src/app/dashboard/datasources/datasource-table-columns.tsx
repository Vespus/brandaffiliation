"use client";

import { DataTableColumnHeader } from "@/components/datatable/data-table-column-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Datasource } from "@/db/types";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Database, Eye, FileText, Pencil, Tag, Trash2 } from "lucide-react";
import Link from "next/link";
import * as React from "react";

export function getDatasourceTableColumns(
    onEdit: (datasource: Datasource) => void,
    onDelete: (id: number) => void,
    isPendingDelete: boolean
): ColumnDef<Datasource>[] {
    return [
        {
            id: "name",
            accessorKey: "name",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Name"/>
            ),
            cell: ({row}) => <div className="min-w-20">{row.getValue("name")}</div>,
            enableSorting: true,
            enableHiding: false,
            meta: {
                label: "Name",
                placeholder: "Search names...",
                variant: "text",
                icon: Tag,
            },
            enableColumnFilter: true
        },
        {
            id: "description",
            accessorKey: "description",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Description"/>
            ),
            cell: ({row}) => <div className="min-w-20">{row.getValue("description") || "-"}</div>,
            enableSorting: true,
            enableHiding: false,
            meta: {
                label: "Description",
                placeholder: "Search descriptions...",
                variant: "text",
                icon: FileText,
            },
            enableColumnFilter: true
        },
        {
            id: "valueColumn",
            accessorKey: "valueColumn",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Value Column"/>
            ),
            cell: ({row}) => <div className="min-w-20">{row.getValue("valueColumn")}</div>,
            enableSorting: true,
            enableHiding: false,
            meta: {
                label: "Value Column",
                placeholder: "Search value columns...",
                variant: "text",
                icon: Database,
            },
            enableColumnFilter: true
        },
        {
            id: "displayColumn",
            accessorKey: "displayColumn",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Display Column"/>
            ),
            cell: ({row}) => <div className="min-w-20">{row.getValue("displayColumn")}</div>,
            enableSorting: true,
            enableHiding: false,
            meta: {
                label: "Display Column",
                placeholder: "Search display columns...",
                variant: "text",
                icon: Database,
            },
            enableColumnFilter: true
        },
        {
            id: "createdAt",
            accessorKey: "createdAt",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Created At"/>
            ),
            cell: ({row}) => <div className="min-w-20">{format(row.getValue("createdAt"), "PPPP HH:mm")}</div>,
            enableSorting: true,
            enableHiding: false,
            meta: {
                label: "Created At",
                variant: "date",
            },
            enableColumnFilter: true
        },
        {
            id: "actions",
            header: () => <div className="text-right">Actions</div>,
            cell: ({row}) => {
                const datasource = row.original;

                return (
                    <div className="flex justify-end space-x-2">

                        <Link className={buttonVariants({variant: "outline", size: "icon"})}
                              href={`/dashboard/datasources/${datasource.id}`}>
                            <Eye className="h-4 w-4"/>
                        </Link>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onEdit(datasource)}
                        >
                            <Pencil className="h-4 w-4"/>
                        </Button>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onDelete(datasource.id)}
                            disabled={isPendingDelete}
                        >
                            <Trash2 className="h-4 w-4"/>
                        </Button>
                    </div>
                );
            },
            enableSorting: false,
            enableHiding: false,
        },
    ];
}
