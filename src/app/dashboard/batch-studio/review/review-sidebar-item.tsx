'use client'

import React from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { Check, ChevronRightIcon, DatabaseIcon, LayersIcon, XIcon, ZapIcon } from 'lucide-react'
import { toast } from 'sonner'
import { removeReviewTask, SaveReviewTaskToQSPay } from '@/app/dashboard/batch-studio/review/actions'
import { ReviewJoin } from '@/app/dashboard/batch-studio/tasks/type'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useCustomAction } from '@/hooks/use-custom-action'
import { cn } from '@/lib/utils'

export const ReviewSidebarItem = ({ item }: { item: ReviewJoin }) => {
    const router = useRouter()
    const { id: activeItemId } = useParams()

    const removeReview = useCustomAction(removeReviewTask, {
        onSuccess: () => {
            router.refresh()
        },
    })
    const acceptReview = useCustomAction(SaveReviewTaskToQSPay, {
        onSuccess: () => {
            toast.success('Successfully saved to QSPay')
            router.refresh()
        },
    })

    const acceptReviewHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        e.stopPropagation()

        acceptReview.execute([
            {
                config: item.review.config!,
                contentId: item.review.id,
            },
        ])
    }
    const isSelected = Number(activeItemId) === item.review.id
    const Icon = ({ type, ...props }: { type: string; className: string }) => {
        return type === 'brand' ? (
            <DatabaseIcon {...props} />
        ) : type === 'category' ? (
            <LayersIcon {...props} />
        ) : (
            <ZapIcon {...props} />
        )
    }
    const entityName = [item.brand?.name, item.category?.name].filter(Boolean).join(' - ')

    return (
        <Link
            href={`/dashboard/batch-studio/review/${item.review.id}`}
            className={cn(
                'flex items-center justify-between rounded-lg border p-3 transition-all',
                isSelected && 'border-blue-200 bg-blue-50 ring-2 ring-blue-500'
            )}
        >
            <div className="flex flex-col space-y-1">
                <span className="text-muted-foreground flex items-center gap-1 text-xs capitalize">
                    <Icon type={item.review.entityType} className="size-3" /> {item.review.entityType}
                </span>
                <div className="flex flex-col gap-0.5 text-xs">
                    <span className="font-bold capitalize">{entityName}</span>
                </div>
            </div>
            <div className="flex items-center justify-end gap-2">
                <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-green-600 hover:bg-green-100 hover:text-green-700"
                    loading={acceptReview.isPending}
                    onClick={acceptReviewHandler}
                >
                    <Check className="h-3 w-3" />
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0 text-red-600 hover:bg-red-100 hover:text-red-700"
                            loading={removeReview.isPending}
                        >
                            <XIcon />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Every AI request requires using a paid service. This action cannot be undone. You will
                                lose the generated content.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => removeReview.executeAsync({ reviewId: item.review.id })}
                            >
                                Continue
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <ChevronRightIcon className="size-3" />
            </div>
        </Link>
    )
}
