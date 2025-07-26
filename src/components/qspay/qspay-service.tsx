import { QSPayServiceClient } from "@/components/qspay/qspay-service-client";
import { CheckIcon, XIcon } from "lucide-react";
import { QspayStoreSelectorClient } from "@/components/qspay/qspay-store-selector.client";
import { Badge } from "@/components/ui/badge";
import { QSPayClient } from "@/lib/qs-pay-client";
import { QSPayUser } from "@/qspay-types";
import { cookies } from "next/headers";

export const QSPayService = async () => {
    const cookie = await cookies()
    const {result} = await QSPayClient<QSPayUser>("User/Get");
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
            <Badge variant={result ? "outline" : "destructive"} className={result && "h-9"}>
                {result ? <CheckIcon className="text-emerald-500" size={12}/> : <XIcon className="text-white"/>}
                {result ? "Connected" : "Disconnected"}
            </Badge>
        </div>
    )
}