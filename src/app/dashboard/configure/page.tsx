import { Suspense } from 'react'

import { eq } from 'drizzle-orm'
import { Models } from '@/app/dashboard/configure/models'
import { db } from '@/db'
import { getAISettings } from '@/db/presets'
import { aiModels } from '@/db/schema'
import { AISetting } from '@/db/types'

export default async function BrandsPage() {
    const [AIModels, AISettings] = await Promise.all([
        db.query.aiModels.findMany({
            where: eq(aiModels.isActive, true),
            with: {
                aiProvider: {
                    columns: {
                        name: true,
                        code: true,
                    },
                },
            },
        }),
        getAISettings(),
    ])

    return (
        <div className="max-w-4xl">
            <Suspense>
                <Models aiModels={AIModels} aiSettings={AISettings as AISetting[]} />
            </Suspense>
        </div>
    )
}
