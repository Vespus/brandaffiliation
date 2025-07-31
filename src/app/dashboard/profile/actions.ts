'use server'

import { revalidatePath } from 'next/cache'

import { eq } from 'drizzle-orm'
import { ProfileUpdateSchema } from '@/app/dashboard/profile/schema'
import { db } from '@/db'
import { users } from '@/db/schema'
import { actionClient } from '@/lib/action-client'
import { getUser } from '@/lib/get-user'

export const updateProfileAction = actionClient.inputSchema(ProfileUpdateSchema).action(async ({ parsedInput }) => {
    const { user } = await getUser()

    await db
        .update(users)
        .set({
            name: parsedInput.name,
            image: parsedInput.image,
        })
        .where(eq(users.id, user.id))

    revalidatePath('/dashboard/profile', 'layout')
})
