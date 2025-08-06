'use server'

import { cookies } from 'next/headers'

import { and, eq, inArray } from 'drizzle-orm'
import z from 'zod'
import { db } from '@/db'
import { tasks } from '@/db/schema'
import { actionClient } from '@/lib/action-client'

export const saveTask = actionClient
    .inputSchema(
        z.array(
            z.object({
                entityType: z.string(),
                entityId: z.string(),
                status: z.string(),
                specification: z.any(),
            })
        )
    )
    .action(async ({ parsedInput }) => {
        const cookie = await cookies()
        const storeId = cookie.get('qs-pay-store-id')?.value!

        const existingTasks = await db
            .select()
            .from(tasks)
            .where(
                and(
                    inArray(
                        tasks.entityId,
                        parsedInput.map((x) => x.entityId)
                    ),
                    eq(tasks.entityType, parsedInput[0].entityType),
                    eq(tasks.storeId, storeId)
                )
            )

        const existingIdList = existingTasks.map((x) => x.entityId)
        const insertTask = parsedInput.filter((x) => !existingIdList.includes(x.entityId))

        if (insertTask.length === 0) {
            throw new Error('No new task to save, Selected entities may already have a task')
        }

        await db.insert(tasks).values(insertTask.map((x) => ({ ...x, storeId })))
    })
