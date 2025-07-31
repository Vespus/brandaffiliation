import React, { ReactNode } from 'react'

import { getReviewTasks } from '@/app/dashboard/batch-studio/review/query'
import { ReviewSidebar } from '@/app/dashboard/batch-studio/review/review-sidebar'

export default async function Layout({ children }: { children: ReactNode }) {
    const contents = await getReviewTasks()

    return (
        <div className="-mx-8 flex max-h-[calc(100svh_-_calc(var(--spacing)_*_16)_-_calc(var(--spacing)_*_4)))] flex-1 flex-col">
            <div className="flex min-h-0 flex-1">
                <ReviewSidebar contents={contents} />
                <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
            </div>
        </div>
    )
}
