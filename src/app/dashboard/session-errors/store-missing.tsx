"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { CircleAlertIcon } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";

export const StoreMissing = () => {
    const [error, setError] = useQueryState("error", parseAsString)

    return (
        <AlertDialog open={Boolean(error)} onOpenChange={() => setError(null)}>
            <AlertDialogContent>
                <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                    <div
                        className="flex size-9 shrink-0 items-center justify-center rounded-full border"
                        aria-hidden="true"
                    >
                        <CircleAlertIcon className="opacity-80" size={16}/>
                    </div>
                    <AlertDialogHeader>
                        <AlertDialogTitle>No store selected</AlertDialogTitle>
                        <AlertDialogDescription>
                            You need to select a store to use this feature
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                </div>
                <AlertDialogFooter>
                    <AlertDialogAction>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )

}