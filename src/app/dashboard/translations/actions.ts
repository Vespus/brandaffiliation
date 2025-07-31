'use server'

import { revalidatePath } from 'next/cache'

import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db'
import { translations } from '@/db/schema'
import { actionClient } from '@/lib/action-client'

// Schema for adding/updating a translation
const translationSchema = z.object({
    entityType: z.string().min(1).max(20),
    entityId: z.string().min(1).max(50),
    langCode: z.string().min(2).max(10),
    textValue: z.string().min(1),
})

// Add a new translation
export const addTranslation = actionClient.inputSchema(translationSchema).action(async ({ parsedInput }) => {
    const existingTranslation = await db.query.translations.findFirst({
        where: and(
            eq(translations.entityType, parsedInput.entityType),
            eq(translations.entityId, parsedInput.entityId),
            eq(translations.langCode, parsedInput.langCode)
        ),
    })

    if (existingTranslation) {
        throw new Error('Translation already exists')
    }

    try {
        await db.insert(translations).values({
            entityType: parsedInput.entityType,
            entityId: parsedInput.entityId,
            langCode: parsedInput.langCode,
            textValue: parsedInput.textValue,
        })

        revalidatePath('/dashboard/translations')
        return { success: true, message: 'Translation added successfully' }
    } catch (error) {
        console.error('Error adding translation:', error)
        throw new Error('Failed to add translation')
    }
})

export const updateTranslation = actionClient
    .inputSchema(
        translationSchema.extend({
            id: z.number(),
        })
    )
    .action(async ({ parsedInput }) => {
        try {
            // Update the translation
            await db
                .update(translations)
                .set({ textValue: parsedInput.textValue })
                .where(eq(translations.id, parsedInput.id))

            revalidatePath('/dashboard/translations')
            return { success: true, message: 'Translation updated successfully' }
        } catch (error) {
            console.error('Error updating translation:', error)
            throw new Error('Failed to update translation')
        }
    })

// Delete a translation
export const deleteTranslation = actionClient
    .inputSchema(
        z.object({
            id: z.number(),
        })
    )
    .action(async ({ parsedInput }) => {
        try {
            // Delete the translation
            await db.delete(translations).where(eq(translations.id, parsedInput.id))

            revalidatePath('/dashboard/translations')

            return { success: true, message: 'Translation deleted successfully' }
        } catch (error) {
            console.error('Error deleting translation:', error)
            throw new Error('Failed to delete translation')
        }
    })
