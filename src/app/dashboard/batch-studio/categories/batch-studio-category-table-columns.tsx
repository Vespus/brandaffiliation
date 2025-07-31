'use client'

import * as React from 'react'

import Link from 'next/link'

import { ColumnDef } from '@tanstack/react-table'
import { CheckIcon, StarIcon, Text, XIcon } from 'lucide-react'
import { BatchStudioCategoryType } from '@/app/dashboard/batch-studio/categories/batch-studio-category-type'
import { MetaOutput } from '@/app/dashboard/content-generation/types'
import { DataTableColumnHeader } from '@/components/datatable/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useQSPayContext } from '@/hooks/contexts/use-qspay-context'

export function useGetBatchStudioCategoryTableColumns(): ColumnDef<BatchStudioCategoryType>[] {
    const { currentStore } = useQSPayContext()

    return [
        {
            id: 'select',
            header: ({ table }) => (
                <div className="flex gap-2">
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
                        }
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                        className="translate-y-0.5"
                    />
                </div>
            ),
            cell: ({ row }) => (
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
            id: 'description',
            accessorKey: 'description',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
            cell: ({ row }) => <div className="text-xs">{row.getValue('description')}</div>,
            enableSorting: true,
            enableHiding: false,
            meta: {
                label: 'Category Title',
                placeholder: 'Search categories...',
                variant: 'text',
                icon: Text,
            },
            enableColumnFilter: true,
        },
        {
            id: 'slug',
            accessorKey: 'slug',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Slug" />,
            cell: ({ row }) => {
                if (currentStore) {
                    const url = new URL(currentStore?.storeUrl)
                    url.pathname = row.original.slug.split('/').filter(Boolean).join('/')

                    return (
                        <Link href={url.toString()} target="_blank" className="text-xs underline">
                            {url.toString()}
                        </Link>
                    )
                }
                return <span className="text-xs">N/A</span>
            },
            enableSorting: false,
            enableColumnFilter: false,
        },
        {
            id: 'integrationId',
            accessorKey: 'integrationId',
            header: ({ column }) => <DataTableColumnHeader column={column} title="QSPay Identifier" />,
            cell: ({ row }) => <div className="text-xs">{row.getValue('integrationId')}</div>,
            enableSorting: false,
            enableColumnFilter: false,
        },
        {
            id: 'content',
            accessorKey: 'content',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Content" />,
            cell: ({ row }) => {
                const value = row.getValue('content') as MetaOutput
                const hasHeader = value?.descriptions?.header
                const hasFooter = value?.descriptions?.footer
                const hasMetaTitle = value?.meta?.title

                return (
                    <div className="flex items-center gap-2">
                        <Badge variant={hasMetaTitle ? 'outline' : 'destructive'} className="gap-1">
                            {hasMetaTitle ? (
                                <CheckIcon className="text-emerald-500" />
                            ) : (
                                <XIcon className="text-white" />
                            )}
                            Meta Title
                        </Badge>
                        <Badge variant={hasHeader ? 'outline' : 'destructive'} className="gap-1">
                            {hasHeader ? <CheckIcon className="text-emerald-500" /> : <XIcon className="text-white" />}
                            Top Text
                        </Badge>
                        <Badge variant={hasFooter ? 'outline' : 'destructive'} className="gap-1">
                            {hasFooter ? <CheckIcon className="text-emerald-500" /> : <XIcon className="text-white" />}
                            Footer Text
                        </Badge>
                    </div>
                )
            },
            enableSorting: false,
            enableColumnFilter: true,
            meta: {
                label: 'Has Content',
                variant: 'select',
                options: [
                    {
                        label: 'Yes',
                        value: 'yes',
                    },
                    {
                        label: 'No',
                        value: 'no',
                    },
                ],
                icon: StarIcon,
            },
        },
    ]
}
