'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { and, eq, inArray } from 'drizzle-orm'
import { toMerged } from 'es-toolkit'
import z from 'zod'
import { MetaOutput, PartialMetaOutput, PartialMetaOutputSchema } from '@/app/dashboard/content-generation/types'
import { db } from '@/db'
import { brands, categories, combinations, contents, tasks } from '@/db/schema'
import { Content } from '@/db/types'
import { actionClient } from '@/lib/action-client'
import { QSPayClient } from '@/lib/qs-pay-client'
import { QSPayBrand, QSPayCategory, QSPayCombin } from '@/qspay-types'
import { cookies } from 'next/headers'

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

        await db.insert(tasks).values(insertTask.map(x => ({...x, storeId})))
    })
