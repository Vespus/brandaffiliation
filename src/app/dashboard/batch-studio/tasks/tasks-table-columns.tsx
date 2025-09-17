'use client'

import * as React from 'react'

import { ColumnDef } from '@tanstack/react-table'
import { ListEndIcon, ListXIcon, TrashIcon } from 'lucide-react'
import { RemoveTaskAction } from '@/app/dashboard/batch-studio/tasks/action'
import { useSchedulerContext } from '@/app/dashboard/batch-studio/tasks/scheduler/scheduler-context'
import { TaskJoin } from '@/app/dashboard/batch-studio/tasks/type'
import { DataTableActionBarAction } from '@/components/datatable/data-table-action-bar'
import { DataTableColumnHeader } from '@/components/datatable/data-table-column-header'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { useCustomAction } from '@/hooks/use-custom-action'
import { cn } from '@/lib/utils'

export function useGetTasksTableColumns(): ColumnDef<TaskJoin>[] {
    return [
        {
            id: 'select',
            header: ({ table }) => {
                return (
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
                        }
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                        className="translate-y-0.5"
                    />
                )
            },
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="translate-y-0.5"
                />
            ),
            size: 40,
        },
        {
            id: 'entityName',
            accessorKey: 'entityName',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Task Name" />,
            cell: ({ row }) => <div className="text-xs">{row.original.entityName}</div>,
        },
        {
            id: 'type',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Task Type" />,
            cell: ({ row }) => (
                <div className="text-muted-foreground text-xs capitalize">{row.original.task.entityType}</div>
            ),
        },
        {
            id: 'Brand Name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Brand Name" />,
            cell: ({ row }) => (
                <div className="text-muted-foreground text-xs capitalize">
                    {row.original.brand?.name || 'Not Available'}
                </div>
            ),
        },
        {
            id: 'Category Name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Category Name" />,
            cell: ({ row }) => (
                <div className="text-muted-foreground text-xs capitalize">
                    {row.original.category?.description || 'Not Available'}
                </div>
            ),
        },
        {
            id: 'Combination Name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Combination Name" />,
            cell: ({ row }) => (
                <div className="text-muted-foreground text-xs capitalize">
                    {row.original.combination?.name || 'Not Available'}
                </div>
            ),
        },
        {
            id: 'Status',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
            cell: ({ row }) => {
                const runner = useSchedulerContext()
                const run = runner.getRun(row.original.task.id)

                return (
                    <div
                        className={cn(
                            'text-muted-foreground flex flex-col gap-1 text-xs capitalize px-2 rounded-md py-1',
                            run && 'bg-gradient-to-r from-yellow-50'
                        )}
                    >
                        {run ? <span>{run.streamStatus || run.status}</span> : <span>Not Enqueued</span>}
                        <Progress
                            value={run?.progress || 0}
                            indicatorClassName={cn(
                                run?.status === 'retry_queued' && 'bg-amber-500',
                                run?.status === 'failed' && 'bg-red-500',
                                run?.status === 'succeeded' && 'bg-green-500'
                            )}
                        />
                    </div>
                )
            },
            size: 150
        },
        {
            id: 'Actions',
            header: ({ column }) => <DataTableColumnHeader column={column} title="" />,
            cell: ({ row }) => {
                const runner = useSchedulerContext()
                const run = runner.getRun(row.original.task.id)

                const removeTask = useCustomAction(RemoveTaskAction, {
                    onExecute: () => {
                        runner.removeTask(row.original.task.id, 'delete')
                    },
                })

                return (
                    <div className="flex items-center justify-end gap-1">
                        {!run && (
                            <DataTableActionBarAction
                                tooltip="Enqueue Task"
                                side="left"
                                onClick={() => runner.loadTask(row.original)}
                                size="icon"
                            >
                                <ListEndIcon className="size-4" />
                            </DataTableActionBarAction>
                        )}
                        {run && (
                            <DataTableActionBarAction
                                tooltip="Dequeue Task"
                                side="left"
                                className="hover:text-destructive-foreground text-amber-600"
                                onClick={() => runner.removeTask(row.original.task.id, 'delete')}
                                size="icon"
                            >
                                <ListXIcon className="size-4" />
                            </DataTableActionBarAction>
                        )}

                        <DataTableActionBarAction
                            tooltip="Remove Task"
                            className="text-destructive hover:text-destructive-foreground"
                            onClick={() => removeTask.execute({ taskId: row.original.task.id })}
                            isPending={removeTask.isPending}
                            size="icon"
                        >
                            <TrashIcon className="size-4" />
                        </DataTableActionBarAction>
                    </div>
                )
            },
        },
    ]
}
