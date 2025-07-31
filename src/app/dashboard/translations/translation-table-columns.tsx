'use client'

import * as React from 'react'

import type { ColumnDef } from '@tanstack/react-table'

import { FileText, Hash, Pencil, Text, Trash2 } from 'lucide-react'
import { DataTableColumnHeader } from '@/components/datatable/data-table-column-header'
import { Button } from '@/components/ui/button'
import { Translation } from '@/db/types'

export function getTranslationTableColumns(
    onEdit: (translation: Translation) => void,
    onDelete: (id: number) => void,
    isPendingDelete: boolean
): ColumnDef<Translation>[] {
    return [
        {
            id: 'entityType',
            accessorKey: 'entityType',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Entity Type" />,
            cell: ({ row }) => <div className="min-w-20">{row.getValue('entityType')}</div>,
            enableSorting: true,
            enableHiding: false,
            meta: {
                label: 'Entity Type',
                placeholder: 'Search entity types...',
                variant: 'text',
                icon: Text,
            },
            enableColumnFilter: true,
        },
        {
            id: 'entityId',
            accessorKey: 'entityId',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Entity ID" />,
            cell: ({ row }) => <div className="min-w-20">{row.getValue('entityId')}</div>,
            enableSorting: true,
            enableHiding: false,
            meta: {
                label: 'Entity ID',
                placeholder: 'Search entity IDs...',
                variant: 'text',
                icon: Hash,
            },
            enableColumnFilter: true,
        },
        {
            id: 'langCode',
            accessorKey: 'langCode',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Language" />,
            cell: ({ row }) => <div className="min-w-20">{row.getValue('langCode')}</div>,
            enableSorting: true,
            enableHiding: false,
            meta: {
                label: 'Language',
                variant: 'multiSelect',
                options: [
                    { label: 'English', value: 'en' },
                    { label: 'German', value: 'de' },
                    { label: 'Spanish', value: 'es' },
                    { label: 'French', value: 'fr' },
                    { label: 'Italian', value: 'it' },
                    { label: 'Portuguese', value: 'pt' },
                    { label: 'Dutch', value: 'nl' },
                ],
            },
            enableColumnFilter: true,
        },
        {
            id: 'textValue',
            accessorKey: 'textValue',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Text" />,
            cell: ({ row }) => <div className="max-w-[200px] truncate">{row.getValue('textValue')}</div>,
            enableSorting: true,
            enableHiding: false,
            meta: {
                label: 'Text',
                placeholder: 'Search text...',
                variant: 'text',
                icon: FileText,
            },
            enableColumnFilter: true,
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const translation = row.original

                return (
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="icon" onClick={() => onEdit(translation)}>
                            <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onDelete(translation.id)}
                            disabled={isPendingDelete}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                )
            },
            enableSorting: false,
            enableHiding: false,
        },
    ]
}
