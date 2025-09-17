'use client';

import React, { use } from 'react';



import Link from 'next/link';



import { Table } from '@tanstack/react-table'
import { ArrowLeftIcon, ListEndIcon, ListXIcon } from 'lucide-react'
import { useSchedulerContext } from '@/app/dashboard/batch-studio/tasks/scheduler/scheduler-context';
import { TasksQueueManagement } from '@/app/dashboard/batch-studio/tasks/tasks-queue-management';
import { useGetTasksTableColumns } from '@/app/dashboard/batch-studio/tasks/tasks-table-columns';
import { TaskJoin } from '@/app/dashboard/batch-studio/tasks/type';
import { DataTable } from '@/components/datatable/data-table';
import { DataTableActionBar, DataTableActionBarAction, DataTableActionBarSelection } from '@/components/datatable/data-table-action-bar';
import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useDataTable } from '@/hooks/use-data-table';


interface TasksTableProps {
    promise: Promise<{ data: TaskJoin[]; pageCount: number; total: number }>
}

export const TasksTable = ({ promise }: TasksTableProps) => {
    const { data, pageCount, total } = use(promise)

    const columns = useGetTasksTableColumns()

    const { table } = useDataTable({
        data: data,
        columns: columns,
        pageCount: pageCount,
        rowCount: total,
        shallow: false,
        clearOnDefault: true,
        getRowId: (row) => row.id.toString(),
    })

    return (
        <div className="flex gap-4">
            <div className="flex-1">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-start gap-2">
                        <div className="flex flex-col">
                            <h1 className="text-lg font-semibold mb-4">Tasks</h1>
                            <div className="flex flex-col text-xs">
                                <p className="text-muted-foreground">How to use the Scheduler:</p>
                                <ol className="list-decimal list-inside">
                                    <li>Queue the available tasks into Scheduler by either selecting via checkboxes or individually</li>
                                    <li>Click "Start Process" to feed the queue into AI</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                    <Link href="/dashboard/batch-studio/review" className={buttonVariants()}>
                        View Reviews
                    </Link>
                </div>

                <DataTable table={table} actionBar={<TaskTableActionBar table={table} />} />
            </div>
            <div className="w-full max-w-lg flex-none">
                <TasksQueueManagement tasks={data} />
            </div>
        </div>
    )
}

const TaskTableActionBar = ({ table }: { table: Table<TaskJoin> }) => {
    const rows = table.getFilteredSelectedRowModel().rows
    const runner = useSchedulerContext<TaskJoin, number>()

    const enqueue = () => {
        rows.forEach((x) => runner.loadTask(x.original))
        table.toggleAllRowsSelected(false)
    }
    const dequeue = () => {
        rows.forEach((x) => runner.removeTask(x.original.task.id, 'delete'))
        table.toggleAllRowsSelected(false)
    }

    return (
        <DataTableActionBar table={table} visible={rows.length > 0}>
            <DataTableActionBarSelection table={table} />
            <Separator orientation="vertical" className="hidden data-[orientation=vertical]:h-5 sm:block" />
            <DataTableActionBarAction size="icon" tooltip="Enqueue Tasks" onClick={enqueue}>
                <ListEndIcon />
            </DataTableActionBarAction>
            <DataTableActionBarAction size="icon" tooltip="Dequeue Tasks" onClick={dequeue}>
                <ListXIcon />
            </DataTableActionBarAction>
        </DataTableActionBar>
    )
}
