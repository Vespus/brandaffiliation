import { redirect } from 'next/navigation'

import { getReviewTasks } from '@/app/dashboard/batch-studio/review/query'

export default async function ReviewPage() {
    const contents = await getReviewTasks()

    if (contents.length > 0) {
        redirect(`/dashboard/batch-studio/review/${contents[0].review.id}`)
    }

    return <div className="px-4">Please select a review from sidebar.</div>
}
