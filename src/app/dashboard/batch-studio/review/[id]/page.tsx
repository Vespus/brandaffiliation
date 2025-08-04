import React from 'react'

import { redirect } from 'next/navigation'

import { ReviewForm } from '@/app/dashboard/batch-studio/review/[id]/review-form'
import { ReviewHandlers } from '@/app/dashboard/batch-studio/review/[id]/review-handlers'
import { getReviewTask } from '@/app/dashboard/batch-studio/review/query'
import { Scroller } from '@/components/ui/scroller'

type ReviewPageProps = {
    params: Promise<{ id: string }>
}

export default async function ReviewPage(props: ReviewPageProps) {
    const { id } = await props.params
    const review = await getReviewTask(id)

    if (!review) {
        redirect('/dashboard/batch-studio/review')
    }

    const entityName = [review.brand?.name, review.category?.name].filter(Boolean).join(' - ')

    return (
        <div className="flex min-h-0 flex-col">
            <div className="flex items-center justify-between border-b px-4 py-8">
                <div className="flex flex-col">
                    <div className="flex flex-col text-lg">
                        <span className="font-bold capitalize">{entityName}</span>
                    </div>
                    <span className="text-muted-foreground text-sm">
                        Review and approve SEO content for this category
                    </span>
                </div>
                <ReviewHandlers item={review} />
            </div>
            <Scroller className="min-h-0 flex-1">
                <ReviewForm item={review} />
            </Scroller>
        </div>
    )
}
