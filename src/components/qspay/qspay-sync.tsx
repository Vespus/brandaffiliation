'use client'

import * as React from 'react'

import { RefreshCcwIcon } from 'lucide-react'
import { toast } from 'sonner'
import { sync } from '@/components/qspay/qspay-service-action'
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
import { useRouter } from 'next/navigation'

export const QsPaySync = () => {
    const router = useRouter()
    const SyncAction = useCustomAction(sync, {
        onSuccess: () => {
            toast.success('Successfully synced')
            router.refresh()
        },
    })

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    className="text-destructive hover:text-destructive hover:bg-destructive/5"
                    loading={SyncAction.isPending}
                    variant="outline"
                >
                    <RefreshCcwIcon />
                    Sync
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This synchronizes the QSPay data with the Brandaffiliation. Process sometimes removes tasks and
                        reviews if the relevant entity is not found in the QSPay anymore.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => SyncAction.executeAsync()}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
