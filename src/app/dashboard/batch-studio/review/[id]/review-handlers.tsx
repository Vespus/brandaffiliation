'use client'

import * as React from 'react'
import { useMemo } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { EyeIcon, XIcon } from 'lucide-react'
import { removeReviewTask } from '@/app/dashboard/batch-studio/review/actions'
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
import { Button, buttonVariants } from '@/components/ui/button'
import { useQSPayContext } from '@/hooks/contexts/use-qspay-context'
import { useCustomAction } from '@/hooks/use-custom-action'

export const ReviewHandlers = ({ item }: { item: ReviewJoin }) => {
    const { currentStore } = useQSPayContext()
    const router = useRouter()

    const getStoreSlug = useMemo(() => {
        if (currentStore) {
            const url = new URL(currentStore?.storeUrl)
            url.pathname = [item.category?.slug, item.brand?.slug].join('/').split('/').filter(Boolean).join('/')
            return url.toString()
        }

        return undefined
    }, [currentStore, item])

    const removeReview = useCustomAction(removeReviewTask, {
        onSuccess: () => {
            router.refresh()
        },
    })

    return (
        <div className="flex gap-2">
            {getStoreSlug && (
                <Link target="_blank" className={buttonVariants({ variant: 'outline' })} href={getStoreSlug}>
                    <EyeIcon />
                    Preview
                </Link>
            )}

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                        className="text-destructive hover:text-destructive hover:bg-destructive/5"
                        loading={removeReview.isPending}
                        variant="outline"
                    >
                        <XIcon />
                        Reject
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Every AI request requires using a paid service. This action cannot be undone. You will lose
                            the generated content.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => removeReview.executeAsync({ contentId: item.content.id })}>
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div id="review-form-portal-additional-handlers"></div>
        </div>
    )
}
