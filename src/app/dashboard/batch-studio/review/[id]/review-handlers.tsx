'use client'

import * as React from 'react'
import { useMemo } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { BotIcon, EyeIcon, ReceiptTextIcon, SparklesIcon, XIcon } from 'lucide-react'
import Markdown from 'react-markdown'
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Scroller } from '@/components/ui/scroller'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useQSPayContext } from '@/hooks/contexts/use-qspay-context'
import { useCustomAction } from '@/hooks/use-custom-action'
import { prettyPrintUserPrompt } from '@/utils/xml-beautifier'

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

            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline">
                        <ReceiptTextIcon />
                        See Prompt
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-7xl">
                    <DialogHeader>
                        <DialogTitle>Prompts</DialogTitle>
                        <DialogDescription>See system and generated prompts</DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="system" className="space-y-6">
                        <TabsList className="grid w-fit grid-cols-2">
                            <TabsTrigger value="system" className="flex items-center space-x-2">
                                <BotIcon className="h-4 w-4" />
                                <span>System Prompt</span>
                            </TabsTrigger>
                            <TabsTrigger value="user" className="flex items-center space-x-2">
                                <SparklesIcon className="h-4 w-4" />
                                <span>User Prompt</span>
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="system">
                            <Scroller className="prose prose-sm h-96 max-w-none">
                                <Markdown>{item.review.userPrompt?.system}</Markdown>
                            </Scroller>
                        </TabsContent>
                        <TabsContent value="user">
                            <Scroller className="h-96 text-sm">
                                <pre className="bg-background whitespace-pre-wrap">
                                    <code>{prettyPrintUserPrompt(item.review.userPrompt?.prompt)}</code>
                                </pre>
                            </Scroller>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>

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
                        <AlertDialogAction onClick={() => removeReview.executeAsync({ reviewId: item.review.id })}>
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div id="review-form-portal-additional-handlers"></div>
        </div>
    )
}
