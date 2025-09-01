'use client'

import { useEffect } from 'react'

import Link from 'next/link'

import { BanIcon, PauseIcon, PlayIcon } from 'lucide-react'
import { Entity } from '@/app/dashboard/batch-studio/tasks/entity'
import { useTaskQueue } from '@/app/dashboard/batch-studio/tasks/hooks/use-task-queue'
import { useTasksStore } from '@/app/dashboard/batch-studio/tasks/tasks.store'
import { TaskJoin } from '@/app/dashboard/batch-studio/tasks/type'
import { Button, buttonVariants } from '@/components/ui/button'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const MAX_CONCURRENCY = 5

export const TaskController = ({ tasks }: { tasks: TaskJoin[] }) => {
    const { tasks: storeTasks, setStoreTasks } = useTasksStore()
    const { startAll, pauseAll, stopAll, isProcessingAll, isPaused, stats } = useTaskQueue()

    useEffect(() => {
        setStoreTasks(tasks)
    }, [tasks, setStoreTasks])
    return (
        <div className="container">
            <div className="my-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {!isProcessingAll && (
                        <Button onClick={startAll}>
                            <PlayIcon />
                            Process All
                        </Button>
                    )}
                    {isProcessingAll && (
                        <Button variant="outline" onClick={pauseAll}>
                            {!isPaused ? <PauseIcon /> : <PlayIcon />}
                            {!isPaused ? 'Pause' : 'Resume'}
                        </Button>
                    )}
                    {isProcessingAll && (
                        <Button variant="outline" onClick={stopAll}>
                            <BanIcon />
                            Stop All
                        </Button>
                    )}
                </div>
                <div className="flex gap-4">
                    <div className="flex flex-col text-xs">
                        <span>{stats.total} Total task records</span>
                        <span>
                            {stats.completed} completed, {stats.processing} processing, {stats.queued} queued
                        </span>
                        <span>
                            {stats.running}/{MAX_CONCURRENCY} running slots used
                        </span>
                    </div>
                    <div>
                        <Link href="/dashboard/batch-studio/review" className={buttonVariants()}>
                            Go To Reviews
                        </Link>
                    </div>
                </div>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Identifier</TableHead>
                        <TableHead>Task Name</TableHead>
                        <TableHead>Task Type</TableHead>
                        <TableHead>Combination Name</TableHead>
                        <TableHead>Category Name</TableHead>
                        <TableHead>Brand Name</TableHead>
                        <TableHead className="w-xs">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Object.values(storeTasks).map((taskState) => (
                        <Entity
                            key={taskState.task.task.entityType + taskState.task.task.entityId + taskState.task.task.id}
                            taskState={taskState}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
