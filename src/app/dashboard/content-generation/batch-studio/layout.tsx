import {BrandsWidget} from "@/app/dashboard/content-generation/batch-studio/widgets/brands-widget";
import {CategoriesWidget} from "@/app/dashboard/content-generation/batch-studio/widgets/categories-widget";
import {CombinationsWidget} from "@/app/dashboard/content-generation/batch-studio/widgets/combinations-widget";
import {ContentGenerationProvider} from "@/app/dashboard/content-generation/content-generation-context";
import {cookies} from "next/headers";
import {QSPayClient} from "@/lib/qs-pay-client";
import {QSPayStore} from "@/qspay-types";
import React from "react";

export default async function Layout({children}: Readonly<{ children: React.ReactNode; }>) {
    const cookieList = await cookies();

    const {result: store} = await QSPayClient<QSPayStore>("Store/Get", {
        query: {
            storeId: cookieList.get("qs-pay-store-id")?.value
        }
    })

    return (
        <ContentGenerationProvider store={store}>
            <>
                <div className="flex flex-none flex-col flex-wrap gap-4 pb-6 xl:flex-row xl:gap-0">
                    <BrandsWidget/>
                    <div
                        className="relative w-0 before:absolute before:left-0 before:top-0 before:h-full before:w-px before:bg-muted hidden xl:block"></div>
                    <CategoriesWidget/>
                    <div
                        className="relative w-0 before:absolute before:left-0 before:top-0 before:h-full before:w-px before:bg-muted hidden xl:block"></div>
                    <CombinationsWidget/>
                </div>
                <div className="flex flex-1 gap-4">
                    {children}
                </div>
            </>
        </ContentGenerationProvider>
    )
}