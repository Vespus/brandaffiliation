"use client"
import {ReviewJoin} from "@/app/dashboard/batch-studio/tasks/type";
import {MetaOutput} from "@/app/dashboard/content-generation/types";

export const ReviewCard = ({item}: { item: ReviewJoin }) => {

    return (
        <div className="flex gap-4 min-w-0 flex-1">
            <div className="flex-1">
                a
            </div>
            {item.content.oldConfig && <OldContent config={item.content.oldConfig}/>}
        </div>
    )
}

const OldContent = ({config}: { config: MetaOutput }) => {
    return (
        <div className="flex-1 bg-red-50 min-w-0">
            <div className="border-b">Old SEO Content</div>
            <pre className="flex-none overflow-x-auto">{JSON.stringify(config, null, 2)}</pre>
        </div>
    )
}