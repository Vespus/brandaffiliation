import { getReviewTasks } from "@/app/dashboard/batch-studio/review/query";
import { ReviewMenuItem } from "@/app/dashboard/batch-studio/review/review-menu-item";
import { ReviewJoin } from "@/app/dashboard/batch-studio/tasks/type";
import { Scroller } from "@/components/ui/scroller";
import React, { ReactNode } from "react";

export default async function Layout({children}: { children: ReactNode }) {
    const contents = await getReviewTasks()

    return (
        <div
            className="space-y-6 flex-1 flex flex-col max-h-[calc(100svh_-_calc(var(--spacing)_*_16)_-_calc(var(--spacing)_*_4)))]">
            <div className="flex flex-1 min-h-0">
                <div className="w-full max-w-xs border-r flex-none flex flex-col">
                    <div className="font-semibold text-xs">Awaiting Review Queue</div>
                    <Scroller className="min-h-0 flex-1">
                        <ul className="space-y-1">
                            {contents.length <= 0 && <span className="text-xs">No Review Queue</span>}
                            {contents.map((item: ReviewJoin) => (
                                <ReviewMenuItem key={item.content.id} item={item}/>
                            ))}
                        </ul>
                    </Scroller>
                </div>
                <div className="flex-1 min-w-0 min-h-0 flex flex-col">
                    {children}
                </div>
            </div>
        </div>
    )
}