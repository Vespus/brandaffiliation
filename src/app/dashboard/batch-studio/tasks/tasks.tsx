'use client'

import { SchedulerProvider } from '@/app/dashboard/batch-studio/tasks/scheduler/scheduler-context'
import { streamProgressFromRoute } from '@/app/dashboard/batch-studio/tasks/scheduler/scheduler-fetch-helper'
import { ProgressTweener } from '@/app/dashboard/batch-studio/tasks/scheduler/scheduler-fetch-progress-helper'
import { TasksTable } from '@/app/dashboard/batch-studio/tasks/tasks-table'
import { TaskJoin } from '@/app/dashboard/batch-studio/tasks/type'

interface TasksProps {
    promise: Promise<{ data: TaskJoin[]; pageCount: number; total: number }>
}

export const Tasks = ({ promise }: TasksProps) => {
    return (
        <SchedulerProvider<TaskJoin, number>
            options={{
                maxConcurrency: 4,
                identity: (t) => t.task.id,
                delayMs: 2000,
                handler: async (run, { setProgress, setStreamProgress }) => {
                    const tweener = new ProgressTweener((pct) => setProgress(run.id, Math.round(pct)), 0)

                    try {
                        await streamProgressFromRoute(
                            () =>
                                fetch('/api/content-stream', {
                                    method: 'POST',
                                    body: JSON.stringify({ taskId: run.record.task.id }),
                                }),
                            (pct, latestStatus) => {
                                const duration = latestStatus === 'finished' ? 400 : 900
                                tweener.toPercent(pct, { duration })
                            },
                            {
                                stepPercent: {
                                    'initiated...': 10,
                                    'fetched necessary data...': 20,
                                    'prompt generated...': 30,
                                    'AI generation in progress...': 40,
                                    'AI generation completed...': 80,
                                    'AI generation failed...': 100,
                                    'Task ready to review.': 100,
                                },
                                onStatus: (status) => {
                                    setStreamProgress(run.id, status)
                                },
                            }
                        )
                        tweener.snap(100)
                    } catch (err) {
                        tweener.cancel()
                        throw err
                    } finally {
                        tweener.cancel()
                    }
                },
            }}
        >
            <TasksTable promise={promise} />
        </SchedulerProvider>
    )
}
