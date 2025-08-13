import { create } from 'zustand'
import { TaskJoin } from '@/app/dashboard/batch-studio/tasks/type'

export type TaskStatus = 'idle' | 'queued' | 'processing' | 'completed' | 'error' | 'paused'

export interface TaskState {
    task: TaskJoin
    status: TaskStatus
    progress: number
    retryCount: number
    errorMessage?: string
}

interface TasksStoreType {
    tasks: Record<string, TaskState>
    runningTasks: Set<string>
    isProcessingAll: boolean
    isPaused: boolean
    setStoreTasks: (tasks: TaskJoin[]) => void
    updateTaskStatus: (taskId: string, status: TaskStatus, progress?: number) => void
    updateTaskProgress: (taskId: string, progress: number) => void
    incrementRetryCount: (taskId: string) => void
    setTaskError: (taskId: string, error: string) => void
    startTask: (taskId: string) => void
    pauseTask: (taskId: string) => void
    removeTask: (taskId: string) => void
    startProcessingAll: () => void
    pauseProcessingAll: () => void
    stopProcessingAll: () => void
    addToRunningTasks: (taskId: string) => void
    removeFromRunningTasks: (taskId: string) => void
    getNextQueuedTasks: (limit: number) => TaskState[]
}

const initialState = {
    tasks: {},
    runningTasks: new Set<string>(),
    isProcessingAll: false,
    isPaused: false,
}

export const useTasksStore = create<TasksStoreType>((set, get) => ({
    ...initialState,
    
    setStoreTasks: (tasks: TaskJoin[]) => set(state => {
        const taskStates: Record<string, TaskState> = {}
        tasks.forEach(task => {
            const existing = state.tasks[task.task.id]
            taskStates[task.task.id] = {
                task,
                status: existing?.status || 'idle',
                progress: existing?.progress || 0,
                retryCount: existing?.retryCount || 0,
                errorMessage: existing?.errorMessage,
            }
        })
        return { ...state, tasks: taskStates }
    }),
    
    updateTaskStatus: (taskId: string, status: TaskStatus, progress?: number) => set(state => {
        const task = state.tasks[taskId]
        if (!task) return state
        return {
            ...state,
            tasks: {
                ...state.tasks,
                [taskId]: {
                    ...task,
                    status,
                    progress: progress !== undefined ? progress : task.progress
                }
            }
        }
    }),
    
    updateTaskProgress: (taskId: string, progress: number) => set(state => {
        const task = state.tasks[taskId]
        if (!task) return state
        return {
            ...state,
            tasks: {
                ...state.tasks,
                [taskId]: { ...task, progress }
            }
        }
    }),
    
    incrementRetryCount: (taskId: string) => set(state => {
        const task = state.tasks[taskId]
        if (!task) return state
        return {
            ...state,
            tasks: {
                ...state.tasks,
                [taskId]: { ...task, retryCount: task.retryCount + 1 }
            }
        }
    }),
    
    setTaskError: (taskId: string, error: string) => set(state => {
        const task = state.tasks[taskId]
        if (!task) return state
        return {
            ...state,
            tasks: {
                ...state.tasks,
                [taskId]: { ...task, status: 'error', errorMessage: error }
            }
        }
    }),
    
    startTask: (taskId: string) => set(state => {
        const task = state.tasks[taskId]
        if (!task) return state
        return {
            ...state,
            tasks: {
                ...state.tasks,
                [taskId]: { ...task, status: 'queued', progress: 0 }
            }
        }
    }),
    
    pauseTask: (taskId: string) => set(state => {
        const task = state.tasks[taskId]
        if (!task) return state
        return {
            ...state,
            tasks: {
                ...state.tasks,
                [taskId]: { ...task, status: 'paused' }
            },
            runningTasks: new Set([...state.runningTasks].filter(id => id !== taskId))
        }
    }),
    
    removeTask: (taskId: string) => set(state => {
        const { [taskId]: removed, ...remainingTasks } = state.tasks
        return {
            ...state,
            tasks: remainingTasks,
            runningTasks: new Set([...state.runningTasks].filter(id => id !== taskId))
        }
    }),
    
    startProcessingAll: () => set(state => ({
        ...state,
        isProcessingAll: true,
        isPaused: false
    })),
    
    pauseProcessingAll: () => set(state => ({
        ...state,
        isPaused: !state.isPaused
    })),
    
    stopProcessingAll: () => set(state => ({
        ...state,
        isProcessingAll: false,
        isPaused: false,
        runningTasks: new Set()
    })),
    
    addToRunningTasks: (taskId: string) => set(state => ({
        ...state,
        runningTasks: new Set([...state.runningTasks, taskId])
    })),
    
    removeFromRunningTasks: (taskId: string) => set(state => ({
        ...state,
        runningTasks: new Set([...state.runningTasks].filter(id => id !== taskId))
    })),
    
    getNextQueuedTasks: (limit: number) => {
        const state = get()
        const queuedTasks = Object.values(state.tasks)
            .filter(task => task.status === 'queued')
            .slice(0, limit)
        return queuedTasks
    }
}))
