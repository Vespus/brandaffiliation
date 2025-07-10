"use client";

import {DataTableColumnHeader} from "@/components/datatable/data-table-column-header";
import {buttonVariants} from "@/components/ui/button";
import {SimpleRating} from "@/components/ui/simple-rating";
import {BrandWithCharacteristicAndScales} from "@/db/types";
import {ColumnDef, RowData} from "@tanstack/react-table";
import {ArrowBigRightDash, ArrowRight, CheckIcon, CrossIcon, StarIcon, Text, XIcon,} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import {BatchStudioBrandType} from "@/app/dashboard/batch-studio/brands/batch-studio-brand-type";
import {Checkbox} from "@/components/ui/checkbox";

declare module '@tanstack/react-table' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface TableMeta<TData extends RowData> {
        t: (id: string) => string;
    }
}

export function getBatchStudioBrandTableColumns(): ColumnDef<BatchStudioBrandType>[] {
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
            id: "name",
            accessorKey: "name",
            header: ({column, table: {options: {meta}}}) => (
                <DataTableColumnHeader column={column} title={meta!.t("brand.label")!}/>
            ),
            cell: ({row}) => <div>{row.getValue("name")}</div>,
            enableSorting: true,
            enableHiding: false,
            meta: {
                label: "Brand Title",
                placeholder: "Search brands...",
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

