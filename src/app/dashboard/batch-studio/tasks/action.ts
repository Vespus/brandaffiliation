'use server'

import { revalidatePath } from 'next/cache'

import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db'
import { tasks } from '@/db/schema'
import { actionClient } from '@/lib/action-client'

export const RemoveTaskAction = actionClient
    .inputSchema(
        z.object({
            taskId: z.number(),
        })
    )
    .action(async ({ parsedInput: { taskId } }) => {
        await db.delete(tasks).where(eq(tasks.id, taskId))
        revalidatePath('/dashboard/batch-studio/tasks')
    })
