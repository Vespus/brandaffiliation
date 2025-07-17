import {BrandsWidget} from "@/app/dashboard/batch-studio/widgets/brands-widget";
import {CategoriesWidget} from "@/app/dashboard/batch-studio/widgets/categories-widget";
import {CombinationsWidget} from "@/app/dashboard/batch-studio/widgets/combinations-widget";
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
                {children}
        </ContentGenerationProvider>
    )
}