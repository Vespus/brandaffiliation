import React from 'react'

import { ReviewSidebarHandler } from '@/app/dashboard/batch-studio/review/review-sidebar-handler'
import { ReviewSidebarItem } from '@/app/dashboard/batch-studio/review/review-sidebar-item'
import { ReviewJoin } from '@/app/dashboard/batch-studio/tasks/type'
import { Badge } from '@/components/ui/badge'
import { Scroller } from '@/components/ui/scroller'

export const ReviewSidebar = ({ contents }: { contents: ReviewJoin[] }) => {
    return (
        <div className="flex w-full max-w-xs flex-none flex-col border-r">
            <div className="mb-6 flex flex-col gap-8 border-b px-4 pt-4 pb-6">
                <div className="flex items-center justify-between gap-8">
                    <h3 className="text-lg font-medium">Review Queue</h3>
                    <Badge>{contents.length} Pending</Badge>
                </div>
                <ReviewSidebarHandler contents={contents} />
            </div>
            <Scroller className="min-h-0 flex-1">
                <div className="space-y-2 px-4 py-2">
                    {contents.length <= 0 && <span className="text-xs">No Review Queue</span>}
                    {contents.map((item: ReviewJoin) => (
                        <ReviewSidebarItem key={item.content.id} item={item} />
                    ))}
                </div>
            </Scroller>
        </div>
    )
}
