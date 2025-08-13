import { useMutation } from '@tanstack/react-query'
import { useTasksStore } from '@/app/dashboard/batch-studio/tasks/tasks.store'
import { TaskJoin } from '@/app/dashboard/batch-studio/tasks/type'

interface TaskProcessorOptions {
    onSuccess?: (taskId: string) => void
    onError?: (taskId: string, error: string) => void
    onProgress?: (taskId: string, progress: number) => void
}

export const useTaskProcessor = (options: TaskProcessorOptions = {}) => {
    const {
        updateTaskStatus,
        updateTaskProgress,
        incrementRetryCount,
        setTaskError,
        addToRunningTasks,
        removeFromRunningTasks,
    } = useTasksStore()

    const processTaskMutation = useMutation({
        mutationFn: async ({ task }: { task: TaskJoin }) => {
            const response = await fetch('/api/content-stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    taskId: task.task.id,
                    specification: task.task.specification,
                }),
            })

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            return response.json()
        },
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    })

    const simulateProgress = (taskId: string, onComplete: () => void) => {
        let current = 0
        const startTime = Date.now()
        const targetDuration = 30000 + Math.random() * 10000 // 30-40 seconds as per requirements

        const interval = setInterval(
            () => {
                const elapsed = Date.now() - startTime
                const timeProgress = elapsed / targetDuration

                // Calculate expected progress (up to 90%)
                const expectedProgress = Math.min(timeProgress * 90, 90)

                // Add randomness but keep it realistic
                const randomFactor = 0.5 + Math.random() // 0.5 to 1.5 multiplier
                const baseIncrement = (expectedProgress - current) * 0.3 * randomFactor

                // Ensure we always make some progress
                const increment = Math.max(0.5, Math.min(baseIncrement, 8))
                current += increment

                // Sometimes have small pauses
                const shouldPause = Math.random() < 0.15 // 15% chance
                if (!shouldPause) {
                    updateTaskProgress(taskId, Math.min(current, 90))
                    options.onProgress?.(taskId, Math.min(current, 90))
                }

                // Clear when we reach 90% or time is up
                if (current >= 90 || elapsed >= targetDuration) {
                    updateTaskProgress(taskId, 90)
                    options.onProgress?.(taskId, 90)
                    clearInterval(interval)
                    onComplete()
                }
            },
            300 + Math.random() * 700
        ) // Random interval between 300ms-1000ms

        return interval
    }

    const processTask = async (task: TaskJoin) => {
        const taskId = task.task.id.toString()
        let progressInterval: NodeJS.Timeout

        try {
            // Start processing
            updateTaskStatus(taskId, 'processing', 0)
            addToRunningTasks(taskId)

            // Start progress simulation
            const progressPromise = new Promise<void>((resolve) => {
                progressInterval = simulateProgress(taskId, resolve)
            })

            // Start actual API call
            const apiPromise = processTaskMutation.mutateAsync({ task })

            // Wait for API call to complete
            await apiPromise

            // Wait for progress to reach 90%
            await progressPromise

            // Complete the task
            updateTaskProgress(taskId, 100)
            updateTaskStatus(taskId, 'completed', 100)
            removeFromRunningTasks(taskId)

            options.onSuccess?.(taskId)
        } catch (error) {
            // Clear progress interval if it exists
            if (progressInterval!) {
                clearInterval(progressInterval!)
            }

            incrementRetryCount(taskId)
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

            // Check if we should retry (handled by TanStack Query)
            const store = useTasksStore.getState()
            const taskState = store.tasks[taskId]

            if (taskState && taskState.retryCount >= 3) {
                // Max retries reached
                setTaskError(taskId, errorMessage)
                updateTaskStatus(taskId, 'error')
                removeFromRunningTasks(taskId)
                options.onError?.(taskId, errorMessage)
            } else {
                // Will retry
                updateTaskStatus(taskId, 'queued', 0)
                removeFromRunningTasks(taskId)

                // Retry after delay
                setTimeout(
                    () => {
                        if (!store.isPaused && store.isProcessingAll) {
                            processTask(task)
                        }
                    },
                    2000 * (taskState?.retryCount || 1)
                ) // Increasing delay
            }
        }
    }

    return {
        processTask,
        isProcessing: processTaskMutation.isPending,
    }
}
