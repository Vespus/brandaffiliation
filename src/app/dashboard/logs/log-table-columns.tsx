'use client';

import * as React from 'react';



import Link from 'next/link';



import { ColumnDef, RowData } from '@tanstack/react-table';
import { format } from 'date-fns'
import {
    ArrowBigRightDash,
    ArrowRight,
    ArrowUpDown,
    BotIcon,
    ReceiptTextIcon,
    SparklesIcon,
    StarIcon,
    Text,
} from 'lucide-react'
import Markdown from 'react-markdown';
import { LogTableType } from '@/app/dashboard/logs/log-table-type';
import { DataTableColumnHeader } from '@/components/datatable/data-table-column-header';
import { Button, buttonVariants } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Scroller } from '@/components/ui/scroller';
import { SimpleRating } from '@/components/ui/simple-rating';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { prettyPrintUserPrompt } from '@/utils/xml-beautifier';


declare module '@tanstack/react-table' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface TableMeta<TData extends RowData> {
        t: (id: string) => string
    }
}

function calcCostUSD(inputTokens: number, outputTokens: number): number {
    const inputRate = 3 // $3 per 1M input tokens
    const outputRate = 15 // $15 per 1M output tokens

    const inputCost = (inputTokens / 1_000_000) * inputRate
    const outputCost = (outputTokens / 1_000_000) * outputRate

    return +(inputCost + outputCost).toFixed(6) // round to 6 decimals
}

export function getLogTableColumns(): ColumnDef<LogTableType>[] {
    return [
        {
            id: 'id',
            accessorKey: 'id',
            header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
            cell: ({ row }) => <div>{row.original.id}</div>,
            enableSorting: false,
            enableHiding: false,
            enablePinning: true,
            size: 40,
        },
        {
            id: 'entityName',
            accessorKey: 'entityName',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
            cell: ({ row }) => <div className="min-w-20">{row.original.entityName}</div>,
            enableSorting: true,
            enableHiding: false,
            enablePinning: true,
            meta: {
                label: 'Log Title',
                placeholder: 'Search logs...',
                variant: 'text',
                icon: Text,
            },
            enableColumnFilter: true,
        },
        {
            id: 'entityRealName',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Category/Brand Names" />,
            cell: ({ row }) => {
                const names = [row.original.category?.description, row.original.brand?.name].filter(Boolean).join(' / ')
                return (
                    <div className="flex gap-2 font-medium">
                        <span>{names}</span>
                    </div>
                )
            },
            enableSorting: false,
            enableHiding: false,
            enablePinning: false,
            enableColumnFilter: false,
        },
        {
            id: 'entityType',
            accessorKey: 'entityType',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Entity Type" />,
            cell: ({ row }) => <div className="text-xs capitalize">{row.original.review.entityType}</div>,
            enableSorting: false,
            enableColumnFilter: true,
            meta: {
                label: 'Entity Type',
                variant: "multiSelect",
                options: [
                    { label: "Category", value: "category" },
                    { label: "Brand", value: "brand" },
                    { label: "Combination", value: "combination" },
                ]/*tasks.priority.enumValues.map((priority) => ({
                    label: priority.charAt(0).toUpperCase() + priority.slice(1),
                    value: priority,
                    count: priorityCounts[priority],
                    icon: getPriorityIcon(priority),
                }))*/,
                icon: ArrowUpDown,
            },
        },
        {
            id: 'createdAt',
            accessorKey: 'createdAt',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
            cell: ({ row }) => (
                <div className="text-xs font-medium capitalize">
                    {format(row.original.review.createdAt!, 'dd/MM/yyyy HH:mm')}
                </div>
            ),
            enableSorting: true,
            enableColumnFilter: false,
        },
        {
            id: 'approvedAt',
            accessorKey: 'approvedAt',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Approved At" />,
            cell: ({ row }) => (
                <div className="text-xs font-medium capitalize">
                    {format(row.original.review.approvedAt!, 'dd/MM/yyyy HH:mm')}
                </div>
            ),
            enableSorting: true,
            enableColumnFilter: false,
        },
        {
            id: 'token',
            accessorKey: 'usage',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Token Usage" />,
            cell: ({ row }) => {
                const inputUsage = calcCostUSD(
                    row.original.review.usage?.inputTokens || 0,
                    row.original.review.usage?.outputTokens || 0
                )
                return (
                    <div className="flex min-w-0 flex-col">
                        <div className="flex gap-2 lg:flex-row">
                            <div className="flex gap-1 text-xs">
                                <span className="text-muted-foreground">Input:</span>
                                <span>{row.original.review.usage?.inputTokens}</span>
                            </div>
                            <div className="flex gap-1 text-xs">
                                <span className="text-muted-foreground">Output:</span>
                                <span>{row.original.review.usage?.outputTokens}</span>
                            </div>
                        </div>
                        <div className="flex gap-1 text-xs">
                            <span className="text-muted-foreground">Total</span>
                            <span>${inputUsage}</span>
                        </div>
                    </div>
                )
            },
            enableSorting: true,
            enableColumnFilter: false,
        },
        {
            id: 'prompt',
            accessorKey: 'userPrompt',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Used Prompts" />,
            cell: ({ row }) => {
                return (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <ReceiptTextIcon />
                                See Prompt
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-7xl">
                            <DialogHeader>
                                <DialogTitle>Prompts</DialogTitle>
                                <DialogDescription>See system and generated prompts</DialogDescription>
                            </DialogHeader>
                            <Tabs defaultValue="system" className="space-y-6">
                                <TabsList className="grid w-fit grid-cols-2">
                                    <TabsTrigger value="system" className="flex items-center space-x-2">
                                        <BotIcon className="h-4 w-4" />
                                        <span>System Prompt</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="user" className="flex items-center space-x-2">
                                        <SparklesIcon className="h-4 w-4" />
                                        <span>User Prompt</span>
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="system">
                                    <Scroller className="prose prose-sm h-96 max-w-none">
                                        <Markdown>{row.original.review.userPrompt?.system}</Markdown>
                                    </Scroller>
                                </TabsContent>
                                <TabsContent value="user">
                                    <Scroller className="h-96 text-sm">
                                        <pre className="bg-background whitespace-pre-wrap">
                                            <code>{prettyPrintUserPrompt(row.original.review.userPrompt?.prompt)}</code>
                                        </pre>
                                    </Scroller>
                                </TabsContent>
                            </Tabs>
                        </DialogContent>
                    </Dialog>
                )
            },
            enableSorting: false,
            enableColumnFilter: false,
        },
        {
            id: 'config',
            accessorKey: 'config',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Generated SEO Contents" />,
            cell: ({ row }) => {
                return (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <ReceiptTextIcon />
                                See Contents
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-7xl">
                            <DialogHeader>
                                <DialogTitle>Generated SEO Contents</DialogTitle>
                                <DialogDescription>See both new and old generated configs</DialogDescription>
                            </DialogHeader>
                            <Tabs defaultValue="system" className="space-y-6">
                                <TabsList className="grid w-fit grid-cols-2">
                                    <TabsTrigger value="new" className="flex items-center space-x-2">
                                        <SparklesIcon className="h-4 w-4" />
                                        <span>New Generated Content</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="old" className="flex items-center space-x-2">
                                        <SparklesIcon className="h-4 w-4" />
                                        <span>Old Content</span>
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="new">
                                    <Scroller className="h-96 max-w-none text-xs">
                                        <pre className="bg-background whitespace-pre-wrap">
                                            {JSON.stringify(row.original.review.config, null, 2)}
                                        </pre>
                                    </Scroller>
                                </TabsContent>
                                <TabsContent value="old">
                                    <Scroller className="h-96 max-w-none text-xs">
                                        <pre className="bg-background whitespace-pre-wrap">
                                            {JSON.stringify(row.original.review.previousConfig, null, 2)}
                                        </pre>
                                    </Scroller>
                                </TabsContent>
                            </Tabs>
                        </DialogContent>
                    </Dialog>
                )
            },
            enableSorting: false,
            enableColumnFilter: false,
        },
    ]
}
