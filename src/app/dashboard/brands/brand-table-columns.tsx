"use client";

import {BrandWithCharacteristic} from "@/db/schema";
import type { ColumnDef } from "@tanstack/react-table";
import {
    ArrowBigRightDash,
    Text,
} from "lucide-react";
import * as React from "react";

import { DataTableColumnHeader } from "@/components/datatable/data-table-column-header";
import {SimpleRating} from "@/components/ui/simple-rating";
import {bekannheitLabels, designLabels, preisLabels, sortimentsbreiteLabels} from "@/utils/scales";

export function getBranchTableColumns(): ColumnDef<BrandWithCharacteristic>[] {
    return [
        {
            id: "name",
            accessorKey: "name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Marke" />
            ),
            cell: ({ row }) => <div className="w-20">{row.getValue("name")}</div>,
            enableSorting: true,
            enableHiding: false,
            meta: {
                label: "Title",
                placeholder: "Search titles...",
                variant: "text",
                icon: Text,
            },
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
                        {characteristics.map(char => (
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
            id: "attributePrice",
            accessorKey: "attributePrice",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Preis" />
            ),
            cell: ({ row }) => {
                return (
                    <SimpleRating value={row.original.attributePrice || 0}>
                        <span className="text-xs">{preisLabels[row.original.attributePrice || 1]}</span>
                    </SimpleRating>
                );
            },
        },
        {
            id: "attributeDesign",
            accessorKey: "attributeDesign",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Design" />
            ),
            cell: ({ row }) => {
                return (
                    <SimpleRating value={row.original.attributeDesign || 0}>
                        <span className="text-xs">{designLabels[row.original.attributeDesign || 1]}</span>
                    </SimpleRating>
                );
            },
        },
        {
            id: "attributeFame",
            accessorKey: "attributeFame",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Bekanntheit" />
            ),
            cell: ({ row }) => {
                return (
                    <SimpleRating value={row.original.attributeFame || 0}>
                        <span className="text-xs">{bekannheitLabels[row.original.attributeFame || 1]}</span>
                    </SimpleRating>
                );
            },
        },
        {
            id: "attributeProductRange",
            accessorKey: "attributeProductRange",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Sortimentsbreite" />
            ),
            cell: ({ row }) => {
                return (
                    <SimpleRating value={row.original.attributeProductRange || 0}>
                        <span className="text-xs">{sortimentsbreiteLabels[row.original.attributeProductRange || 1]}</span>
                    </SimpleRating>
                );
            },
        },
        {
            id: "attributePositioning",
            accessorKey: "attributePositioning",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Positionierung" />
            ),
            cell: ({ row }) => {
                return (
                    <SimpleRating value={row.original.attributePositioning || 0} maxStars={3}>
                        <span className="text-xs">{sortimentsbreiteLabels[row.original.attributePositioning || 1]}</span>
                    </SimpleRating>
                );
            },
        },
    ];
}