import {getReviewTasks} from "@/app/dashboard/batch-studio/review/query";
import {redirect} from "next/navigation";

export default async function ReviewPage() {
    const contents = await getReviewTasks()

    if(contents.length > 0){
        redirect(`/dashboard/batch-studio/review/${contents[0].content.id}`);
    }

    return (
        <div className="px-4">
            Please select a review from sidebar.
        </div>
    )
}