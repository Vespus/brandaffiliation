import { QspayStoreSelectorClient } from "@/components/qspay/qspay-store-selector.client";
import { QSPayClient } from "@/lib/qs-pay-client";
import { QSPayUser } from "@/qspay-types";
import { cookies } from "next/headers";

export const QspayStoreSelectorServer = async () => {
    const {result} = await QSPayClient<QSPayUser>("User/Get");
    const cookieList = await cookies()

    const currentSelectedStore = cookieList.get("qs-pay-store-id")?.value
    const storeList = result.companies[0].merchants[0].stores

    return (
        <div className="w-sm">
            <QspayStoreSelectorClient storeList={storeList} selectedStore={currentSelectedStore}/>
        </div>
    )
}