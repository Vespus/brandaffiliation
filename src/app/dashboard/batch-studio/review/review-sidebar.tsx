import React from "react";
import { ReviewJoin } from "@/app/dashboard/batch-studio/tasks/type";
import { Badge } from "@/components/ui/badge";
import { Scroller } from "@/components/ui/scroller";
import { ReviewSidebarItem } from "@/app/dashboard/batch-studio/review/review-sidebar-item";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";

export const ReviewSidebar = ({contents}: { contents: ReviewJoin[] }) => {
    return (
        <div className="w-full max-w-xs border-r flex-none flex flex-col">
            <div className="flex flex-col gap-8 pt-4 pb-6 mb-6 px-4 border-b">
                <div className="flex gap-8 items-center justify-between">
                    <h3 className="font-medium text-lg">Review Queue</h3>
                    <Badge>{contents.length} Pending</Badge>
                </div>
                <Button><CheckIcon />Accept All</Button>
            </div>
            <Scroller className="min-h-0 flex-1">
                <div className="space-y-2 px-4 py-2">
                    {contents.length <= 0 && <span className="text-xs">No Review Queue</span>}
                    {contents.map((item: ReviewJoin) => (
                        <ReviewSidebarItem key={item.content.id} item={item}/>
                    ))}
                </div>
            </Scroller>
        </div>
    )
}