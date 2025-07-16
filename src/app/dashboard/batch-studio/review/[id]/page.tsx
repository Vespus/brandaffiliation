import {getReviewTask} from "@/app/dashboard/batch-studio/review/query";
import {ReviewCard} from "@/app/dashboard/batch-studio/review/[id]/review-card";

type ReviewPageProps = {
    params: Promise<{id: string}>
}

export default async function ReviewPage(props: ReviewPageProps) {
    const {id} = await props.params
    const content = await getReviewTask(id)

    return (
        <ReviewCard item={content} />
    )
}