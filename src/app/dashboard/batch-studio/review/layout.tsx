import {ReviewJoin} from "@/app/dashboard/batch-studio/tasks/type";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {XIcon} from "lucide-react";
import React, {ReactNode} from "react";
import {getReviewTasks} from "@/app/dashboard/batch-studio/review/query";
import {ReviewMenuItem} from "@/app/dashboard/batch-studio/review/review-menu-item";

export default async function Layout({children}: { children: ReactNode }) {
    const contents = await getReviewTasks()

    return (
        <div className="space-y-6 flex-1 flex flex-col">
            <div className="flex flex-1 min-h-0">
                <div className="w-full max-w-xs border-r flex-none">
                    <div className="font-semibold text-xs">Awaiting Review Queue</div>
                    <ul className="space-y-1">
                        {contents.length <= 0 && <span className="text-xs">No Review Queue</span>}
                        {contents.map((item: ReviewJoin) => (
                            <ReviewMenuItem key={item.content.id} item={item} />
                        ))}
                    </ul>
                </div>
                <div className="flex-1 max-w-full flex flex-col">
                    {children}
                </div>
            </div>
        </div>
    )
}