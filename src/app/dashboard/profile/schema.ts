import { z } from 'zod'

export const ProfileUpdateSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    image: z.string().optional(),
})

export type ProfileFormValues = z.infer<typeof ProfileUpdateSchema>
