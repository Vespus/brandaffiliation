import { useEffect, useRef, useState } from 'react'

import { PlayIcon, Trash2Icon } from 'lucide-react'
import { RemoveTaskAction } from '@/app/dashboard/batch-studio/tasks/action'
import { TaskJoin } from '@/app/dashboard/batch-studio/tasks/type'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { TableCell, TableRow } from '@/components/ui/table'
import { useCustomAction } from '@/hooks/use-custom-action'
import { cn } from '@/lib/utils'

type EntityProps = {
    task: TaskJoin
    shouldStart: boolean
    onJobComplete?: (task: TaskJoin) => void
    onJobStart?: (task: TaskJoin) => void
    onJobError?: (task: TaskJoin) => void
}

export const Entity = ({ task, shouldStart, onJobStart, onJobComplete, onJobError }: EntityProps) => {
    const interval = useRef<ReturnType<typeof setInterval> | number>(0)
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [progress, setProgress] = useState(0)
    const [hasStarted, setHasStarted] = useState(false)

    const simulateProgress = () => {
        let current = 0
        const startTime = Date.now()
        const targetDuration = 20000 + Math.random() * 10000 // 20-30 seconds

        interval.current = setInterval(
            () => {
                const elapsed = Date.now() - startTime
                const timeProgress = elapsed / targetDuration

                // Calculate how much we should have progressed by now
                const expectedProgress = Math.min(timeProgress * 90, 90)

                // Add some randomness but keep it realistic
                const randomFactor = 0.5 + Math.random() // 0.5 to 1.5 multiplier
                const baseIncrement = (expectedProgress - current) * 0.3 * randomFactor

                // Ensure we always make some progress, but vary the amount
                const increment = Math.max(0.5, Math.min(baseIncrement, 8))

                current += increment

                // Sometimes have small pauses or slower periods
                const shouldPause = Math.random() < 0.15 // 15% chance
                if (!shouldPause) {
                    setProgress((prev) => Math.min(prev + increment, 90))
                }

                // Clear when we reach 90% or time is up
                if (current >= 90 || elapsed >= targetDuration) {
                    setProgress(90)
                    clearInterval(interval.current)
                }
            },
            300 + Math.random() * 700
        ) // Random interval between 300ms-1000ms
    }

    const processTask = async () => {
        setHasStarted(true)
        onJobStart?.(task)
        setStatus('loading')
        simulateProgress()

        try {
            const response = await fetch('/api/content-stream', {
                method: 'POST',
                body: JSON.stringify({ taskId: task.task.id }),
            })

            if (!response.ok) {
                setStatus('error')
                onJobError?.(task)
            } else {
                setStatus('success')
                onJobComplete?.(task)
            }
        } catch (e) {
            void e
            setStatus('error')
            onJobError?.(task)
        }

        clearInterval(interval.current)
        setProgress(100)
    }

    const removeTask = useCustomAction(RemoveTaskAction)

    useEffect(() => {
        if (shouldStart && !hasStarted) {
            processTask()
        }
    }, [shouldStart])

    return (
        <TableRow>
            <TableCell>{task.task.id}</TableCell>
            <TableCell>{task.entityName}</TableCell>
            <TableCell>{task.task.entityType}</TableCell>
            <TableCell>{task.combination?.description || 'N/A'}</TableCell>
            <TableCell>{task.category?.description || 'N/A'}</TableCell>
            <TableCell>{task.brand?.name || 'N/A'}</TableCell>
            <TableCell>
                <div className="flex flex-col space-y-2">
                    <span
                        className={cn(
                            'text-xs capitalize',
                            status === 'success' && 'text-green-600',
                            status === 'error' && 'text-red-600',
                            status === 'loading' && 'text-yellow-600',
                            status === 'idle' && 'text-muted-foreground'
                        )}
                    >
                        {status}{' '}
                        {status === 'success' && <span className="text-muted-foreground">/ Waiting Review</span>}
                    </span>
                    <Progress value={progress} />
                </div>
            </TableCell>
            <TableCell>
                <div className="flex justify-end gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        className="p-"
                        loading={status === 'loading'}
                        onClick={processTask}
                    >
                        <PlayIcon className="size-4 text-emerald-500" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        loading={status === 'loading'}
                        onClick={() => removeTask.execute({ taskId: task.task.id })}
                    >
                        <Trash2Icon className="size-4" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    )
}
