"use client";

import { DataTableColumnHeader } from "@/components/datatable/data-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { User } from "better-auth";
import { ArrowRight, Text, } from "lucide-react";
import Link from "next/link";
import * as React from "react";

export function getUsersTableColumns(): ColumnDef<User>[] {
    return [
        {
            id: "link",
            header: () => "",
            cell: ({row}) => {
                return (
                    <Link href={`/dashboard/users/${row.original.id}`}
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
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Name"/>
            ),
            cell: ({row}) => <div className="font-semibold">{row.getValue("name")}</div>,
            enableSorting: true,
            enableHiding: false,
            enablePinning: true,
            meta: {
                label: "Name",
                placeholder: "Search users by name...",
                variant: "text",
                icon: Text,
            },
            enableColumnFilter: true
        },
        {
            id: "email",
            accessorKey: "email",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Email"/>
            ),
            cell: ({row}) => <div className="min-w-48">{row.getValue("email")}</div>,
            enableSorting: true,
            enableHiding: false,
            meta: {
                label: "Email",
                placeholder: "Search users by email...",
                variant: "text",
                icon: Text,
            },
            enableColumnFilter: true
        },
        {
            id: "image",
            accessorKey: "image",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Profile Picture"/>
            ),
            cell: ({row}) => {
                const imageUrl = row.original.image
                const userInitials = row.original.name
                    .split(" ")
                    .map((name) => name.charAt(0).toUpperCase())
                    .join("");

                return (
                    <Avatar className="size-8 rounded-lg">
                        {imageUrl && <AvatarImage src={imageUrl} alt={row.original.name}
                                                  className="aspect-auto object-cover"/>}
                        <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
                    </Avatar>
                )
            },
            enableSorting: true,
            enableHiding: false,
            enableColumnFilter: true
        },
        {
            id: "createdAt",
            accessorKey: "createdAt",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Created At"/>
            ),
            cell: ({row, table: {options: {meta}}}) => {

                return (
                    <div>{meta?.formatter?.dateTime(new Date(row.getValue("createdAt")))}</div>
                )
            },
            enableSorting: true,
            enableHiding: false,
            enableColumnFilter: true
        },
    ];
}

