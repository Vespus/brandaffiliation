import { orderBy } from 'es-toolkit'
import { ListEndIcon, ListXIcon, RotateCcw, SparklesIcon, SquareIcon } from 'lucide-react'
import { useSchedulerContext } from '@/app/dashboard/batch-studio/tasks/scheduler/scheduler-context'
import { TaskJoin } from '@/app/dashboard/batch-studio/tasks/type'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Scroller } from '@/components/ui/scroller'
import { cn } from '@/lib/utils'

export const TasksQueueManagement = ({ tasks }: { tasks: TaskJoin[] }) => {
    const runner = useSchedulerContext<TaskJoin, number>()

    const failedTasks = runner.runs.filter((task) => task.status === 'failed')
    const sortedTasks = orderBy(
        runner.runs,
        [
            (obj) => obj.status === 'running',
            (obj) => obj.status === 'idle',
            (obj) => obj.status === 'queued',
        ],
        ['desc','asc', 'asc']
    )

    return (
        <Card className="overflow-hidden pt-0 shadow-none">
            <CardHeader className="bg-muted py-6">
                <CardTitle>Task Queue</CardTitle>
                <CardDescription>Task runner can be managed here</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="mb-1 text-sm">Currently {runner.runs.length} tasks are queued to be processed.</p>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => runner.loadTasks(tasks)}>
                        <ListEndIcon /> Qeueue All
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => runner.removeAllTasks()}>
                        <ListXIcon /> Dequeue All
                    </Button>
                </div>
                <div className="my-4">
                    <span className="text-sm font-semibold">Task Progress List</span>
                    <Scroller className="relative max-h-96">
                        {sortedTasks.map((task) => (
                            <div key={task.id} className="overflow-hidden rounded-md py-2 pe-4 shadow-none">
                                <div className="flex flex-col">
                                    <div className="flex justify-between">
                                        <span className="text-xs">{task.record.entityName}</span>
                                        <span className="text-xs">{task.streamStatus}</span>
                                    </div>
                                    <Progress
                                        value={task.status === 'failed' ? 100 : task.progress}
                                        indicatorClassName={cn(
                                            task.status === 'retry_queued' && 'bg-amber-500',
                                            task.status === 'failed' && 'bg-red-500',
                                            task.status === 'succeeded' && 'bg-green-500'
                                        )}
                                    />
                                </div>
                            </div>
                        ))}
                    </Scroller>
                </div>
            </CardContent>
            <CardFooter className="gap-2">
                {!runner.isRunning() && (
                    <Button onClick={() => runner.startAll()}>
                        <SparklesIcon className="fill-primary-foreground" />
                        Start Process
                    </Button>
                )}
                {runner.isRunning() && (
                    <Button onClick={() => runner.stopAll()}>
                        <SquareIcon className="fill-primary-foreground" />
                        Stop Process
                    </Button>
                )}
                {failedTasks.length > 0 && (
                    <Button variant="outline" onClick={() => runner.startFailedOnly()}>
                        <RotateCcw />
                        Retry Failed ({failedTasks.length})
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}
