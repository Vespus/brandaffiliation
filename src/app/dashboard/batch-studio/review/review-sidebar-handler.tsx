'use client'

import { CheckIcon } from 'lucide-react'
import { toast } from 'sonner'
import { SaveReviewTaskToQSPay } from '@/app/dashboard/batch-studio/actions'
import { ReviewJoin } from '@/app/dashboard/batch-studio/tasks/type'
import { Button } from '@/components/ui/button'
import { useCustomAction } from '@/hooks/use-custom-action'

export const ReviewSidebarHandler = ({ contents }: { contents: ReviewJoin[] }) => {
    const singleSaveAction = useCustomAction(SaveReviewTaskToQSPay, {
        onSuccess: () => {
            toast.success('Successfully saved')
        },
    })

    return (
        <Button
            loading={singleSaveAction.isPending}
            onClick={() => singleSaveAction.execute(contents.map((item) => ({ contentId: item.content.id })))}
        >
            <CheckIcon />
            Accept All
        </Button>
    )
}
