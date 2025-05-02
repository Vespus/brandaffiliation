"use client";

import {BrandWithCharacteristic} from "@/db/schema";
import type { ColumnDef } from "@tanstack/react-table";
import {
    ArrowBigRightDash, StarIcon,
    Text,
} from "lucide-react";
import * as React from "react";

import { DataTableColumnHeader } from "@/components/datatable/data-table-column-header";
import {SimpleRating} from "@/components/ui/simple-rating";
import {
    fameLabels,
    focusLabels,
    heritageLabels,
    originLabels,
    positioningLabels,
    priceLabels,
    qualityLabels,
    salesVolumeLabels,
} from "@/utils/scales";

export function getBranchTableColumns(): ColumnDef<BrandWithCharacteristic>[] {
    return [
        {
            id: "name",
            accessorKey: "name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Marke" />
            ),
            cell: ({ row }) => <div className="min-w-20 font-semibold">{row.getValue("name")}</div>,
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
            id: "characteristic",
            accessorKey: "characteristic",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Charakteristik" />
            ),
            cell: ({ row }) => {
                const characteristics = row.original.characteristic
                return (
                    <div className="flex flex-col gap-2">
                        {characteristics?.map(char => (
                            <div key={char.id} className="flex gap-2 items-center text-xs">
                                <ArrowBigRightDash size={12} />
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
            accessorKey: "price",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Preis" />
            ),
            cell: ({ row }) => {
                return (
                    <SimpleRating value={row.original.price || 0}>
                        <span className="text-xs">{priceLabels[row.original.price || 1]}</span>
                    </SimpleRating>
                );
            },
            meta: {
                label: "Preis",
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
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Qualität" />
            ),
            cell: ({ row }) => {
                return (
                    <SimpleRating value={row.original.quality || 0}>
                        <span className="text-xs">{qualityLabels[row.original.quality || 1]}</span>
                    </SimpleRating>
                );
            },
            meta: {
                label: "Qualität",
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
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Design" />
            ),
            cell: ({ row }) => {
                return (
                    <SimpleRating value={row.original.design || 0}>
                        <span className="text-xs">{qualityLabels[row.original.design || 1]}</span>
                    </SimpleRating>
                );
            },
            meta: {
                label: "Design",
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
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Schwerpunkt" />
            ),
            cell: ({ row }) => {
                return (
                    <SimpleRating value={row.original.focus || 0}>
                        <span className="text-xs">{focusLabels[row.original.focus || 1]}</span>
                    </SimpleRating>
                );
            },
            meta: {
                label: "Schwerpunkt",
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
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Positionierung" />
            ),
            cell: ({ row }) => {
                return (
                    <SimpleRating value={row.original.positioning || 0}>
                        <span className="text-xs">{positioningLabels[row.original.positioning || 1]}</span>
                    </SimpleRating>
                );
            },
            meta: {
                label: "Positionierung",
                variant: "range",
                range: [1, 5],
                unit: "",
                icon: StarIcon,
            },
            enableColumnFilter: true,
        },
        {
            id: "fame",
            accessorKey: "fame",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Bekanntheit" />
            ),
            cell: ({ row }) => {
                return (
                    <SimpleRating value={row.original.fame || 0}>
                        <span className="text-xs">{fameLabels[row.original.fame || 1]}</span>
                    </SimpleRating>
                );
            },
            meta: {
                label: "Bekanntheit",
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
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Heritage" />
            ),
            cell: ({ row }) => {
                return (
                    <SimpleRating value={row.original.heritage || 0}>
                        <span className="text-xs">{heritageLabels[row.original.heritage || 1]}</span>
                    </SimpleRating>
                );
            },
            meta: {
                label: "Heritage",
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
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Herkunft" />
            ),
            cell: ({ row }) => {
                return (
                    <SimpleRating value={row.original.origin || 0}>
                        <span className="text-xs">{originLabels[row.original.origin || 1]}</span>
                    </SimpleRating>
                );
            },
            meta: {
                label: "Herkunft",
                variant: "range",
                range: [1, 5],
                unit: "",
                icon: StarIcon,
            },
            enableColumnFilter: true,
        },
        {
            id: "sales_volume",
            accessorKey: "sales_volume",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Umsatz" />
            ),
            cell: ({ row }) => {
                return (
                    <SimpleRating value={row.original.sales_volume || 0}>
                        <span className="text-xs">{salesVolumeLabels[row.original.sales_volume || 1]}</span>
                    </SimpleRating>
                );
            },
            meta: {
                label: "Umsatz",
                variant: "range",
                range: [1, 5],
                unit: "",
                icon: StarIcon,
            },
            enableColumnFilter: true,
        },
    ];
}
