import { getReviewTasks } from "@/app/dashboard/batch-studio/review/query";
import React, { ReactNode } from "react";
import { ReviewSidebar } from "@/app/dashboard/batch-studio/review/review-sidebar";

export default async function Layout({children}: { children: ReactNode }) {
    const contents = await getReviewTasks()
console.log(contents)
    return (
        <div
            className="flex-1 flex flex-col max-h-[calc(100svh_-_calc(var(--spacing)_*_16)_-_calc(var(--spacing)_*_4)))] -mx-8">
            <div className="flex flex-1 min-h-0">
                <ReviewSidebar contents={contents}/>
                <div className="flex-1 min-w-0 min-h-0 flex flex-col">
                    {children}
                </div>
            </div>
        </div>
    )
}