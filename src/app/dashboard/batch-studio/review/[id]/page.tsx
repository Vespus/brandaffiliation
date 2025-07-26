import { getReviewTask } from "@/app/dashboard/batch-studio/review/query";
import { ReviewForm } from "@/app/dashboard/batch-studio/review/[id]/review-form";
import { Scroller } from "@/components/ui/scroller";
import { redirect } from "next/navigation";
import React from "react";
import { ReviewHandlers } from "@/app/dashboard/batch-studio/review/[id]/review-handlers";

type ReviewPageProps = {
    params: Promise<{ id: string }>
}

export default async function ReviewPage(props: ReviewPageProps) {
    const {id} = await props.params
    const content = await getReviewTask(id)

    if (!content) {
        redirect("/dashboard/batch-studio/review")
    }

    const entityName = [content.brand?.name, content.category?.name].filter(Boolean).join(" - ")

    return (
        <div className="min-h-0 flex flex-col">
            <div className="flex items-center justify-between px-4 py-8 border-b">
                <div className="flex flex-col">
                    <div className="text-lg flex flex-col">
                        <span className="font-bold capitalize">{entityName}</span>
                    </div>
                    <span className="text-muted-foreground text-sm">Review and approve SEO content for this category</span>
                </div>
                <ReviewHandlers item={content} />
            </div>
            <Scroller className="min-h-0 flex-1">
                <ReviewForm item={content}/>
            </Scroller>
        </div>
    )
}