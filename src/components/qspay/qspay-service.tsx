"use client"

import {QSPayServiceClient} from "@/components/qspay/qspay-service-client";
import {cn} from "@/lib/utils";
import {cva} from "class-variance-authority";
import {CircleSmallIcon} from "lucide-react";
import {useCookie} from "@/hooks/use-cookie";
import {QspayStoreSelectorClient} from "@/components/qspay/qspay-store-selector.client";

export const QSPayService = () => {
    const isActive = useCookie("qs-pay-integration-key")

    const badgeVariants = cva("inline-flex h-6 items-center justify-center gap-2 whitespace-nowrap rounded-md px-2 text-xs", {
        variants: {
            variant: {
                success: "bg-emerald-100 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-900 [&>svg]:fill-emerald",
                error: "bg-red-100 text-red-600 dark:text-red-400 dark:bg-red-900 [&>svg]:fill-red-500"
            }
        },
        defaultVariants: {
            variant: "success",
        }
    })

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs flex-none">QSPay Integration:</span>
            {!isActive && (
                <QSPayServiceClient/>
            )}
            {isActive && (
                <QspayStoreSelectorClient/>
            )}
            <div className={cn(badgeVariants({variant: isActive ? "success" : "error"}))}>
                <CircleSmallIcon fill="currentColor" size={12}/>
                {isActive ? "Connected" : "Disconnected"}
            </div>
        </div>
    )
}