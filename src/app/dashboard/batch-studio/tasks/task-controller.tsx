'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { BanIcon, PauseIcon, PlayIcon } from 'lucide-react'
import { Entity } from '@/app/dashboard/batch-studio/tasks/entity'
import { TaskJoin } from '@/app/dashboard/batch-studio/tasks/type'
import { Button, buttonVariants } from '@/components/ui/button'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const MAX_CONCURRENCY = 3

export const TaskController = ({ tasks }: { tasks: TaskJoin[] }) => {
    const [runningIds, setRunningIds] = useState<number[]>([])
    const [finishedIds, setFinishedIds] = useState<number[]>([])
    const [, setErrorIds] = useState<number[]>([])
    const [isRunning, setIsRunning] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const router = useRouter()

    const startProcess = () => {
        setIsRunning(true)
    }

    const handleTaskFinished = (task: TaskJoin) => {
        setRunningIds((prev) => prev.filter((i) => i !== task.task.id))
        setFinishedIds((prev) => [...prev, task.task.id])

        router.refresh()
    }

    const handleTaskError = (task: TaskJoin) => {
        setErrorIds((prev) => [...prev, task.task.id])
    }

    useEffect(() => {
        if (!isRunning || isPaused) return

        const remaining = tasks.filter(
            (task) => !runningIds.includes(task.task.id) && !finishedIds.includes(task.task.id)
        )

        const canStart = MAX_CONCURRENCY - runningIds.length
        const toStart = remaining.slice(0, canStart)

        if (toStart.length > 0) {
            setRunningIds((prev) => [...prev, ...toStart.map((t) => t.task.id)])
        }
    }, [runningIds, finishedIds, isPaused, tasks, isRunning])

    return (
        <div className="container">
            <div className="my-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {!isRunning && (
                        <Button onClick={startProcess}>
                            <PlayIcon />
                            Start Processing
                        </Button>
                    )}
                    {isRunning && (
                        <Button variant="outline" onClick={() => setIsPaused(!isPaused)}>
                            {!isPaused ? <PauseIcon /> : <PlayIcon />}
                        </Button>
                    )}
                    {isRunning && (
                        <Button variant="outline" onClick={() => setIsRunning(false)}>
                            <BanIcon />
                        </Button>
                    )}
                </div>
                <div className="flex gap-4">
                    <div className="flex flex-col text-xs">
                        <span>{tasks.length} Total task records</span>
                        <span>
                            {finishedIds.length} processed in {runningIds.length} queue
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
                    {tasks.map((task) => (
                        <Entity
                            key={task.task.entityType + task.task.entityId + task.task.id}
                            task={task as TaskJoin}
                            shouldStart={isRunning && runningIds.includes(task.task.id)}
                            onJobComplete={handleTaskFinished}
                            onJobError={handleTaskError}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
