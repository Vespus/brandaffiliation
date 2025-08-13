import { PauseIcon, PlayIcon, Trash2Icon } from 'lucide-react'
import { RemoveTaskAction } from '@/app/dashboard/batch-studio/tasks/action'
import { useTaskQueue } from '@/app/dashboard/batch-studio/tasks/hooks/use-task-queue'
import { TaskState } from '@/app/dashboard/batch-studio/tasks/tasks.store'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { TableCell, TableRow } from '@/components/ui/table'
import { useCustomAction } from '@/hooks/use-custom-action'
import { cn } from '@/lib/utils'

type EntityProps = {
    taskState: TaskState
}

export const Entity = ({ taskState }: EntityProps) => {
    const { task, status, progress, retryCount, errorMessage } = taskState
    const { startSingleTask, pauseSingleTask } = useTaskQueue()
    const removeTask = useCustomAction(RemoveTaskAction)

    const handleStartTask = () => {
        startSingleTask(task.task.id.toString())
    }

    const handlePauseTask = () => {
        pauseSingleTask(task.task.id.toString())
    }

    const handleRemoveTask = () => {
        removeTask.execute({ taskId: task.task.id })
    }

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
                    <div className="flex items-center gap-2">
                        <span
                            className={cn(
                                'text-xs capitalize',
                                status === 'completed' && 'text-green-600',
                                status === 'error' && 'text-red-600',
                                status === 'processing' && 'text-yellow-600',
                                status === 'queued' && 'text-blue-600',
                                status === 'paused' && 'text-orange-600',
                                status === 'idle' && 'text-muted-foreground'
                            )}
                        >
                            {status}{' '}
                            {status === 'completed' && (
                                <span className="text-muted-foreground">/ Ready for Review</span>
                            )}
                        </span>
                        {retryCount > 0 && <span className="text-xs text-orange-500">(Retry {retryCount}/3)</span>}
                    </div>
                    <Progress value={progress} />
                    {errorMessage && (
                        <span className="truncate text-xs text-red-500" title={errorMessage}>
                            {errorMessage}
                        </span>
                    )}
                </div>
            </TableCell>
            <TableCell>
                <div className="flex justify-end gap-1">
                    {['idle', 'error', 'paused'].includes(status) && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleStartTask}
                            disabled={status === 'processing'}
                        >
                            <PlayIcon className="size-4 text-emerald-500" />
                        </Button>
                    )}
                    {['queued', 'processing'].includes(status) && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handlePauseTask}
                            disabled={status === 'processing'}
                        >
                            <PauseIcon className="size-4 text-orange-500" />
                        </Button>
                    )}
                    <Button variant="outline" size="icon" onClick={handleRemoveTask} disabled={status === 'processing'}>
                        <Trash2Icon className="size-4" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    )
}
