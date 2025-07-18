import {getReviewTask} from "@/app/dashboard/batch-studio/review/query";
import {ReviewCard} from "@/app/dashboard/batch-studio/review/[id]/review-card";
import { Scroller } from "@/components/ui/scroller";
import {redirect} from "next/navigation";

type ReviewPageProps = {
    params: Promise<{id: string}>
}

export default async function ReviewPage(props: ReviewPageProps) {
    const {id} = await props.params
    const content = await getReviewTask(id)

    if(!content){
        redirect("/dashboard/batch-studio/review")
    }

    return (
        <Scroller className="min-h-0 flex-1">
            <ReviewCard item={content} />
        </Scroller>
    )
}