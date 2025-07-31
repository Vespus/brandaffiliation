'use server'

import { revalidatePath } from 'next/cache'

import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db'
import { datasourceValues, datasources } from '@/db/schema'
import { actionClient } from '@/lib/action-client'

// Schema for adding/updating a datasource
const datasourceSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    valueColumn: z.string().min(1).max(100),
    displayColumn: z.string().min(1).max(100),
    isMultiple: z.boolean().default(false),
    columns: z.array(z.string()),
    csvData: z.array(z.record(z.string(), z.string())),
})

// Add a new datasource
export const addDatasource = actionClient.inputSchema(datasourceSchema).action(async ({ parsedInput }) => {
    try {
        // Insert the datasource
        const [newDatasource] = await db
            .insert(datasources)
            .values({
                name: parsedInput.name,
                description: parsedInput.description,
                valueColumn: parsedInput.valueColumn,
                displayColumn: parsedInput.displayColumn,
                isMultiple: parsedInput.isMultiple,
                columns: parsedInput.columns,
            })
            .returning()

        // Insert the datasource values
        if (parsedInput.csvData.length > 0) {
            await db.insert(datasourceValues).values(
                parsedInput.csvData.map((data) => ({
                    datasourceId: newDatasource.id,
                    data,
                }))
            )
        }

        revalidatePath('/dashboard/datasources')
        return { success: true, message: 'Datasource added successfully' }
    } catch (error) {
        console.error('Error adding datasource:', error)
        throw new Error('Failed to add datasource')
    }
})

export const updateDatasource = actionClient
    .inputSchema(
        datasourceSchema.extend({
            id: z.number(),
        })
    )
    .action(async ({ parsedInput }) => {
        try {
            // Update the datasource
            await db
                .update(datasources)
                .set({
                    name: parsedInput.name,
                    description: parsedInput.description,
                    valueColumn: parsedInput.valueColumn,
                    displayColumn: parsedInput.displayColumn,
                    isMultiple: parsedInput.isMultiple,
                    columns: parsedInput.columns,
                })
                .where(eq(datasources.id, parsedInput.id))

            // Delete existing values
            await db.delete(datasourceValues).where(eq(datasourceValues.datasourceId, parsedInput.id))

            // Insert new values
            if (parsedInput.csvData.length > 0) {
                await db.insert(datasourceValues).values(
                    parsedInput.csvData.map((data) => ({
                        datasourceId: parsedInput.id,
                        data,
                    }))
                )
            }

            revalidatePath('/dashboard/datasources')
            return { success: true, message: 'Datasource updated successfully' }
        } catch (error) {
            console.error('Error updating datasource:', error)
            throw new Error('Failed to update datasource')
        }
    })

// Delete a datasource
export const deleteDatasource = actionClient
    .inputSchema(
        z.object({
            id: z.number(),
        })
    )
    .action(async ({ parsedInput }) => {
        try {
            // Delete the datasource (cascade will delete values)
            await db.delete(datasources).where(eq(datasources.id, parsedInput.id))

            revalidatePath('/dashboard/datasources')

            return { success: true, message: 'Datasource deleted successfully' }
        } catch (error) {
            console.error('Error deleting datasource:', error)
            throw new Error('Failed to delete datasource')
        }
    })
