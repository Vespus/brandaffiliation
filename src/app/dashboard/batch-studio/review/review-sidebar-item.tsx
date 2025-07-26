"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, ChevronRightIcon, DatabaseIcon, LayersIcon, XIcon, ZapIcon } from "lucide-react";
import React from "react";
import { ReviewJoin } from "@/app/dashboard/batch-studio/tasks/type";
import { useCustomAction } from "@/hooks/use-custom-action";
import { removeReviewTask } from "@/app/dashboard/batch-studio/review/actions";
import { useParams, useRouter } from "next/navigation";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { SaveReviewTaskToQSPay } from "@/app/dashboard/batch-studio/actions";
import { toast } from "sonner";

export const ReviewSidebarItem = ({item}: { item: ReviewJoin }) => {
    const router = useRouter()
    const {id: activeItemId} = useParams()

    const removeReview = useCustomAction(removeReviewTask, {
        onSuccess: () => {
            router.refresh()
        }
    })
    const acceptReview = useCustomAction(SaveReviewTaskToQSPay, {
        onSuccess: () => {
            toast.success("Successfully saved to QSPay")
            router.refresh()
        }
    })

    const acceptReviewHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        e.stopPropagation()

        acceptReview.execute([{
            config: item.content.config!,
            contentId: item.content.id
        }])
    }
    const isSelected = Number(activeItemId) === item.content.id
    const Icon = ({type, ...props}: { type: string, className: string }) => {
        return type === "brand"
            ? <DatabaseIcon {...props}/>
            : type === "category"
                ? <LayersIcon {...props}/>
                : <ZapIcon {...props}/>
    }
    const entityName = [item.brand?.name, item.category?.name].filter(Boolean).join(" - ")

    return (
        <Link
            href={`/dashboard/batch-studio/review/${item.content.id}`}
            className={cn(
                "p-3 rounded-lg border transition-all flex items-center justify-between",
                isSelected && "ring-2 ring-blue-500 border-blue-200 bg-blue-50"
            )}
        >
            <div className="flex flex-col space-y-1">
                <span className="capitalize text-muted-foreground text-xs flex gap-1 items-center">
                    <Icon type={item.content.entityType} className="size-3"/> {item.content.entityType}
                </span>
                <div className="text-xs flex flex-col gap-0.5">
                    <span className="font-bold capitalize">{entityName}</span>
                </div>
            </div>
            <div className="flex justify-end items-center gap-2">
                <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-100"
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
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                            loading={removeReview.isPending}
                        >
                            <XIcon/>
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Every AI request requires using a paid service. This action cannot be undone. You
                                will lose the generated content.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => removeReview.executeAsync({contentId: item.content.id})}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <ChevronRightIcon className="size-3" />
            </div>
        </Link>
    )
}