"use client";

import { BatchStudioCategoryType } from "@/app/dashboard/batch-studio/categories/batch-studio-category-type";
import { DataTableColumnHeader } from "@/components/datatable/data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { StarIcon, Text, XIcon, } from "lucide-react";
import * as React from "react";

export function getBatchStudioCategoryTableColumns(): ColumnDef<BatchStudioCategoryType>[] {
    return [
        {
            id: "select",
            header: ({table}) => (
                <div className="flex gap-2">
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() && "indeterminate")
                        }
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                        className="translate-y-0.5"
                    />
                </div>
            ),
            cell: ({row}) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="translate-y-0.5"
                />
            ),
            enableSorting: false,
            enableHiding: false,
            enablePinning: true,
            size: 40,
        },
        {
            id: "description",
            accessorKey: "description",
            header: ({column, table: {options: {meta}}}) => (
                <DataTableColumnHeader column={column} title="Name"/>
            ),
            cell: ({row}) => <div>{row.getValue("description")}</div>,
            enableSorting: true,
            enableHiding: false,
            meta: {
                label: "Category Title",
                placeholder: "Search categories...",
                variant: "text",
                icon: Text,
            },
            enableColumnFilter: true
        },
        {
            id: "slug",
            accessorKey: "slug",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Slug"/>
            ),
            cell: ({row}) => <div>/{row.getValue("slug")}</div>,
            enableSorting: false,
            enableColumnFilter: false,
        },
        {
            id: "integrationId",
            accessorKey: "integrationId",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="QSPay Identifier"/>
            ),
            cell: ({row}) => <div>{row.getValue("integrationId")}</div>,
            enableSorting: false,
            enableColumnFilter: false,
        },
        {
            id: "content",
            accessorKey: "content",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Content"/>
            ),
            cell: ({row}) => (
                <div className="truncate max-w-xs">
                    {row.getValue("content") ? JSON.stringify(row.getValue("content")) : <span><XIcon/></span>}
                </div>
            ),
            enableSorting: false,
            enableColumnFilter: true,
            meta: {
                label: "Has Content",
                variant: "select",
                options: [
                    {
                        label: "Yes",
                        value: "yes",
                    },
                    {
                        label: "No",
                        value: "no"
                    }
                ],
                icon: StarIcon,
            },
        }
    ];
}

