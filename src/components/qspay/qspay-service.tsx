import { QSPayServiceClient } from "@/components/qspay/qspay-service-client";
import { CheckIcon, XIcon } from "lucide-react";
import { QspayStoreSelectorClient } from "@/components/qspay/qspay-store-selector.client";
import { Badge } from "@/components/ui/badge";
import { cookies } from "next/headers";
import { getQspayUser } from "@/lib/get-qspay-user";
import { cn } from "@/lib/utils";

export const QSPayService = async () => {
    const cookie = await cookies()
    const result = await getQspayUser()
    const stores = result?.companies[0]?.merchants[0]?.stores || []

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs flex-none">QSPay Integration:</span>
            {!result && (
                <QSPayServiceClient/>
            )}
            {stores.length > 0 && (
                <QspayStoreSelectorClient storeList={stores} currentValue={cookie.get('qs-pay-store-id')?.value}/>
            )}
            <Badge variant={result ? "outline" : "destructive"} className={cn(result && "h-9")}>
                {result ? <CheckIcon className="text-emerald-500" size={12}/> : <XIcon className="text-white"/>}
                {result ? "Connected" : "Disconnected"}
            </Badge>
        </div>
    )
}