'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db'
import { systemPrompts } from '@/db/schema'
import { auth } from '@/lib/auth'

const promptSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
    description: z.string().optional(),
    prompt: z.string().min(1, 'Prompt content is required'),
})

export type PromptFormData = z.infer<typeof promptSchema>

async function checkAdminPermissions(userId: string) {
    const { success } = await auth.api.userHasPermission({
        body: {
            userId,
            role: 'admin',
            permission: { prompt: ['create', 'delete'] },
        },
    })

    if (!success) {
        throw new Error('Unauthorized')
    }
}

export async function createPrompt(data: PromptFormData) {
    try {
        // Get current user
        const session = await auth.api.getSession({
            headers: await headers(),
        })
        if (!session?.user) {
            throw new Error('Not authenticated')
        }

        await checkAdminPermissions(session.user.id)

        // Validate data
        const validatedData = promptSchema.parse(data)

        // Create prompt
        const [prompt] = await db
            .insert(systemPrompts)
            .values({
                name: validatedData.name,
                description: validatedData.description || null,
                prompt: validatedData.prompt,
            })
            .returning({ id: systemPrompts.id })

        revalidatePath('/dashboard/prompts')
        return { success: true, data: prompt }
    } catch (error) {
        console.error('Error creating prompt:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create prompt',
        }
    }
}

export async function updatePrompt(id: number, data: PromptFormData) {
    try {
        // Get current user
        const session = await auth.api.getSession({
            headers: await headers(),
        })
        if (!session?.user) {
            throw new Error('Not authenticated')
        }

        await checkAdminPermissions(session.user.id)

        // Validate data
        const validatedData = promptSchema.parse(data)

        // Update prompt
        const [prompt] = await db
            .update(systemPrompts)
            .set({
                name: validatedData.name,
                description: validatedData.description || null,
                prompt: validatedData.prompt,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(systemPrompts.id, id))
            .returning({ id: systemPrompts.id })

        if (!prompt) {
            throw new Error('Prompt not found')
        }

        revalidatePath('/dashboard/prompts')
        revalidatePath(`/dashboard/prompts/${id}`)
        return { success: true, data: prompt }
    } catch (error) {
        console.error('Error updating prompt:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update prompt',
        }
    }
}

export async function deletePrompt(id: number) {
    try {
        // Get current user
        const session = await auth.api.getSession({
            headers: await headers(),
        })
        if (!session?.user) {
            throw new Error('Not authenticated')
        }

        await checkAdminPermissions(session.user.id)

        // Delete prompt
        const [deleted] = await db
            .delete(systemPrompts)
            .where(eq(systemPrompts.id, id))
            .returning({ id: systemPrompts.id })

        if (!deleted) {
            throw new Error('Prompt not found')
        }

        revalidatePath('/dashboard/prompts')
        return { success: true }
    } catch (error) {
        console.error('Error deleting prompt:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete prompt',
        }
    }
}
