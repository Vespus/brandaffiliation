"use client";

import { DataTableColumnHeader } from "@/components/datatable/data-table-column-header";
import { buttonVariants } from "@/components/ui/button";
import { SimpleRating } from "@/components/ui/simple-rating";
import { BrandWithCharacteristicAndScales } from "@/db/types";
import { ColumnDef, RowData } from "@tanstack/react-table";
import { ArrowBigRightDash, ArrowRight, StarIcon, Text, } from "lucide-react";
import Link from "next/link";
import * as React from "react";

declare module '@tanstack/react-table' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface TableMeta<TData extends RowData> {
        t: (id: string) => string;
    }
}

export function getBatchStudioTableColumns(): ColumnDef<BrandWithCharacteristicAndScales>[] {
    return [
        {
            id: "link",
            header: () => "",
            cell: ({row}) => {
                return (
                    <Link href={`/dashboard/brands/${row.original.slug}`}
                          className={buttonVariants({variant: "ghost", size: "icon"})}>
                        <ArrowRight/>
                    </Link>
                )
            },
            enablePinning: true,
            maxSize: 50
        },
        {
            id: "name",
            accessorKey: "name",
            header: ({column, table: {options: {meta}}}) => (
                <DataTableColumnHeader column={column} title={meta!.t("brand.label")!}/>
            ),
            cell: ({row}) => <div className="min-w-20 font-semibold">{row.getValue("name")}</div>,
            enableSorting: true,
            enableHiding: false,
            enablePinning: true,
            meta: {
                label: "Brand Title",
                placeholder: "Search brands...",
                variant: "text",
                icon: Text,
            },
            enableColumnFilter: true
        },
        {
            id: "characteristic",
            accessorKey: "characteristic",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Charakteristik"/>
            ),
            cell: ({row}) => {
                const characteristics = row.original.characteristic
                return (
                    <div className="flex flex-col gap-2">
                        {characteristics?.map(char => (
                            <div key={char.id} className="flex gap-2 items-center text-xs">
                                <ArrowBigRightDash size={12}/>
                                <span>{char.value}</span>
                            </div>
                        ))}
                    </div>
                );
            },
            enableSorting: false,
            enableColumnFilter: false,
        },
        {
            id: "price",
            header: ({column, table: {options: {meta}}}) => (
                <DataTableColumnHeader column={column} title={meta?.t("scale.price") || "Price"}/>
            ),
            cell: ({row}) => {
                return (
                    <SimpleRating value={row.original.price || 0} scale="price"/>
                );
            },
            meta: {
                label: "scale.price",
                labelHasTranslation: true,
                variant: "range",
                range: [1, 5],
                unit: "",
                icon: StarIcon,
            },
            enableColumnFilter: true,
        },
        {
            id: "quality",
            accessorKey: "quality",
            header: ({column, table: {options: {meta}}}) => (
                <DataTableColumnHeader column={column} title={meta?.t("scale.quality") || "Quality"}/>
            ),
            cell: ({row}) => {
                return (
                    <SimpleRating value={row.original.quality || 0} scale="quality"/>
                );
            },
            meta: {
                label: "scale.quality",
                labelHasTranslation: true,
                variant: "range",
                range: [1, 5],
                unit: "",
                icon: StarIcon,
            },
            enableColumnFilter: true,
        },
        {
            id: "design",
            accessorKey: "design",
            header: ({column, table: {options: {meta}}}) => (
                <DataTableColumnHeader column={column} title={meta?.t("scale.design") || "Design"}/>
            ),
            cell: ({row}) => {
                return (
                    <SimpleRating value={row.original.design || 0} scale="design"/>
                );
            },
            meta: {
                label: "scale.design",
                labelHasTranslation: true,
                variant: "range",
                range: [1, 5],
                unit: "",
                icon: StarIcon,
            },
            enableColumnFilter: true,
        },
        {
            id: "focus",
            accessorKey: "focus",
            header: ({column, table: {options: {meta}}}) => (
                <DataTableColumnHeader column={column} title={meta?.t("scale.focus") || "Focus"}/>
            ),
            cell: ({row}) => {
                return (
                    <SimpleRating value={row.original.focus || 0} scale="focus"/>
                );
            },
            meta: {
                label: "scale.focus",
                labelHasTranslation: true,
                variant: "range",
                range: [1, 5],
                unit: "",
                icon: StarIcon,
            },
            enableColumnFilter: true,
        },
        {
            id: "positioning",
            accessorKey: "positioning",
            header: ({column, table: {options: {meta}}}) => (
                <DataTableColumnHeader column={column} title={meta?.t("scale.positioning") || "Positioning"}/>
            ),
            cell: ({row}) => {
                return (
                    <SimpleRating value={row.original.positioning || 0} scale="positioning"/>
                );
            },
            meta: {
                label: "scale.positioning",
                labelHasTranslation: true,
                variant: "range",
                range: [1, 5],
                unit: "",
                icon: StarIcon,
            },
            enableColumnFilter: true,
        },
        {
            id: "recognition",
            accessorKey: "recognition",
            header: ({column, table: {options: {meta}}}) => (
                <DataTableColumnHeader column={column} title={meta?.t("scale.recognition") || "Recognition"}/>
            ),
            cell: ({row}) => {
                return (
                    <SimpleRating value={row.original.recognition || 0} scale="recognition"/>
                );
            },
            meta: {
                label: "scale.recognition",
                labelHasTranslation: true,
                variant: "range",
                range: [1, 5],
                unit: "",
                icon: StarIcon,
            },
            enableColumnFilter: true,
        },
        {
            id: "heritage",
            accessorKey: "heritage",
            header: ({column, table: {options: {meta}}}) => (
                <DataTableColumnHeader column={column} title={meta?.t("scale.heritage") || "Heritage"}/>
            ),
            cell: ({row}) => {
                return (
                    <SimpleRating value={row.original.heritage || 0} scale="heritage"/>
                );
            },
            meta: {
                label: "scale.heritage",
                labelHasTranslation: true,
                variant: "range",
                range: [1, 5],
                unit: "",
                icon: StarIcon,
            },
            enableColumnFilter: true,
        },
        {
            id: "origin",
            accessorKey: "origin",
            header: ({column, table: {options: {meta}}}) => (
                <DataTableColumnHeader column={column} title={meta?.t("scale.origin") || "Origin"}/>
            ),
            cell: ({row}) => {
                return (
                    <SimpleRating value={row.original.origin || 0} scale="origin"/>
                );
            },
            meta: {
                label: "scale.origin",
                labelHasTranslation: true,
                variant: "range",
                range: [1, 5],
                unit: "",
                icon: StarIcon,
            },
            enableColumnFilter: true,
        },
        {
            id: "revenue",
            accessorKey: "revenue",
            header: ({column, table: {options: {meta}}}) => (
                <DataTableColumnHeader column={column} title={meta?.t("scale.revenue") || "Revenue"}/>
            ),
            cell: ({row}) => {
                return (
                    <SimpleRating value={row.original.revenue || 0} scale="revenue"/>
                );
            },
            meta: {
                label: "scale.revenue",
                labelHasTranslation: true,
                variant: "range",
                range: [1, 5],
                unit: "",
                icon: StarIcon,
            },
            enableColumnFilter: true,
        },
    ];
}

