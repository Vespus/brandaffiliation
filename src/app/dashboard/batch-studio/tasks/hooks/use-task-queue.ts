import { useCallback, useEffect } from 'react'

import { useTaskProcessor } from '@/app/dashboard/batch-studio/tasks/hooks/use-task-processor'
import { useTasksStore } from '@/app/dashboard/batch-studio/tasks/tasks.store'

const MAX_CONCURRENT_TASKS = 5

export const useTaskQueue = () => {
    const {
        tasks,
        runningTasks,
        isProcessingAll,
        isPaused,
        getNextQueuedTasks,
        startProcessingAll,
        pauseProcessingAll,
        stopProcessingAll,
        updateTaskStatus,
    } = useTasksStore()

    const { processTask } = useTaskProcessor({
        onSuccess: (taskId) => {
            console.log(`Task ${taskId} completed successfully`)
            // Queue manager will automatically pick up next task
            processQueue()
        },
        onError: (taskId, error) => {
            console.error(`Task ${taskId} failed:`, error)
            // Continue processing other tasks
            processQueue()
        },
    })

    const processQueue = useCallback(() => {
        if (!isProcessingAll || isPaused) {
            return
        }

        // Calculate how many more tasks we can start
        const availableSlots = MAX_CONCURRENT_TASKS - runningTasks.size

        if (availableSlots <= 0) {
            return
        }

        // Get next queued tasks
        const nextTasks = getNextQueuedTasks(availableSlots)

        // Start processing them
        nextTasks.forEach((taskState) => {
            processTask(taskState.task)
        })
    }, [isProcessingAll, isPaused, runningTasks.size, getNextQueuedTasks, processTask])

    // Auto-process queue when conditions change
    useEffect(() => {
        processQueue()
    }, [processQueue])

    const startAll = useCallback(() => {
        // Mark all idle tasks as queued
        Object.keys(tasks).forEach((taskId) => {
            const taskState = tasks[taskId]
            if (taskState.status === 'idle') {
                updateTaskStatus(taskId, 'queued')
            }
        })

        startProcessingAll()
        processQueue()
    }, [tasks, updateTaskStatus, startProcessingAll, processQueue])

    const pauseAll = useCallback(() => {
        pauseProcessingAll()
    }, [pauseProcessingAll])

    const stopAll = useCallback(() => {
        stopProcessingAll()

        // Reset all tasks to idle (except completed and error)
        Object.keys(tasks).forEach((taskId) => {
            const taskState = tasks[taskId]
            if (['queued', 'processing'].includes(taskState.status)) {
                updateTaskStatus(taskId, 'idle', 0)
            }
        })
    }, [stopProcessingAll, tasks, updateTaskStatus])

    const startSingleTask = useCallback(
        (taskId: string) => {
            const taskState = tasks[taskId]
            if (!taskState) return

            updateTaskStatus(taskId, 'queued')

            // If we're not processing all, start this task immediately if slots available
            if (!isProcessingAll && runningTasks.size < MAX_CONCURRENT_TASKS) {
                processTask(taskState.task)
            }
        },
        [tasks, updateTaskStatus, isProcessingAll, runningTasks.size, processTask]
    )

    const pauseSingleTask = useCallback(
        (taskId: string) => {
            const taskState = tasks[taskId]
            if (!taskState) return

            if (taskState.status === 'processing') {
                // Can't pause a currently processing task, but we can mark it
                // The actual stopping would need to be handled in the processor
                console.warn(`Cannot pause task ${taskId} while processing`)
                return
            }

            updateTaskStatus(taskId, 'paused')
        },
        [tasks, updateTaskStatus]
    )

    // Stats
    const getStats = useCallback(() => {
        const taskValues = Object.values(tasks)
        return {
            total: taskValues.length,
            idle: taskValues.filter((t) => t.status === 'idle').length,
            queued: taskValues.filter((t) => t.status === 'queued').length,
            processing: taskValues.filter((t) => t.status === 'processing').length,
            completed: taskValues.filter((t) => t.status === 'completed').length,
            error: taskValues.filter((t) => t.status === 'error').length,
            paused: taskValues.filter((t) => t.status === 'paused').length,
            running: runningTasks.size,
            canStartMore: MAX_CONCURRENT_TASKS - runningTasks.size,
        }
    }, [tasks, runningTasks.size])

    return {
        startAll,
        pauseAll,
        stopAll,
        startSingleTask,
        pauseSingleTask,
        processQueue,
        isProcessingAll,
        isPaused,
        stats: getStats(),
    }
}
