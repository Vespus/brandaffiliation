"use client"

import { Button } from "@/components/ui/button"
import { CheckIcon } from "lucide-react";
import { ReviewJoin } from "@/app/dashboard/batch-studio/tasks/type";
import { useCustomAction } from "@/hooks/use-custom-action";
import { SaveReviewTaskToQSPay } from "@/app/dashboard/batch-studio/actions";
import { toast } from "sonner";

export const ReviewSidebarHandler = ({contents}: { contents: ReviewJoin[] }) => {
    const singleSaveAction = useCustomAction(SaveReviewTaskToQSPay, {
        onSuccess: () => {
            toast.success("Successfully saved")
        }
    })

    return (
        <Button
            loading={singleSaveAction.isPending}
            onClick={() => singleSaveAction.execute(contents.map(item => ({contentId: item.content.id})))}
        >
            <CheckIcon />
            Accept All
        </Button>
    )
}